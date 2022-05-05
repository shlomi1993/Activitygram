import numpy as np
import spacy
import torch
from torch import nn
from torch.nn import functional as F
from torch.optim import Adam
from torch.utils.data import TensorDataset, DataLoader
from matplotlib import pyplot as plt


nlp = spacy.load('en_core_web_sm')

CLASSES = {
    0: 'Will-not-be-interested',
    1: 'Will-be-interested',
    2: 'Will-participate'
}


def create_convolution_layer(in_ch, out_ch, k, stride, pad, pool_k):
    return nn.Sequential(
        nn.Conv2d(in_ch, out_ch, k, stride, pad),
        nn.BatchNorm2d(out_ch),
        nn.ReLU(),
        nn.MaxPool2d(kernel_size=pool_k),
    )


def create_linear_layer(in_features, out_features):
    return nn.Sequential(
        nn.Linear(in_features, out_features),
        nn.BatchNorm1d(out_features),
        nn.ReLU(),
        nn.Dropout(),
    )


def create_train_loaders(train_x_file, train_y_file):
    f = open(train_x_file, 'r')
    texts = f.read().split('<br>')
    f.close()
    descriptions = [nlp(t).vector for t in texts]
    train_x_np = np.array(descriptions)
    train_y_np = np.loadtxt(train_y_file)

    n_train = len(train_x_np)
    indexes = [int(i) for i in list(range(n_train))]
    np.random.shuffle(indexes)
    s = int(0.1 * n_train)
    train_idx = indexes[s:]
    valid_idx = indexes[:s]

    train_x = np.array([train_x_np[i] for i in train_idx])
    train_y = np.array([train_y_np[i] for i in train_idx])
    valid_x = np.array([train_x_np[i] for i in valid_idx])
    valid_y = np.array([train_y_np[i] for i in valid_idx])

    # Convert numpy arrays to normalized tensors.
    train_x_t = torch.from_numpy(train_x).float()
    train_y_t = torch.from_numpy(train_y).long()
    valid_x_t = torch.from_numpy(valid_x).float()
    valid_y_t = torch.from_numpy(valid_y).long()

    # Create tensor datasets.
    train_dataset = TensorDataset(train_x_t, train_y_t)
    valid_dataset = TensorDataset(valid_x_t, valid_y_t)

    # Create and return data loaders (with batch_size=64).
    return DataLoader(train_dataset, 64), DataLoader(valid_dataset, 64)


def create_test_loader(test_x_file):
    f = open(test_x_file, 'r')
    texts = f.read().split('<br>')
    f.close()
    descriptions = [nlp(t).vector for t in texts]
    test_x_np = np.array(descriptions)
    test_x_t = torch.from_numpy(test_x_np).float()
    return texts, DataLoader(test_x_t, 64)


def plot(t_losses, v_losses, t_accuracies, v_accuracies):
    plt.figure()
    plt.title('TCNN - Average loss per epoch')
    plt.xlabel('Epoch')
    plt.ylabel('Loss values')
    plt.plot(list(range(len(t_losses))), t_losses, v_losses)
    plt.legend(["Training Loss", "Validation Loss"])
    plt.savefig("TCNN_Loss_per_Epoch.png")
    plt.figure()
    plt.title('TCNN - Average accuracy per epoch')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy percentages')
    plt.plot(list(range(len(t_accuracies))), t_accuracies, v_accuracies)
    plt.legend(["Training Accuracy", "Validation Accuracy"])
    plt.savefig("TCNN_Accuracy_per_Epoch.png")


class TextClassifierNN(nn.Module):

    def __init__(self):
        super(TextClassifierNN, self).__init__()
        self.linear1 = create_linear_layer(96, 32)
        self.linear2 = create_linear_layer(32, 11)
        self.linear3 = create_linear_layer(11, len(CLASSES))
        self.optim = Adam(self.parameters(), lr=0.01)
        print('Text Classifier Neural Network model created.')

    def forward(self, x):
        out = self.linear1(x)
        out = self.linear2(out)
        out = self.linear3(out)
        out = F.log_softmax(out, -1)
        return out

    def learn(self, train_dataset):
        self.train()
        train_loss = 0
        correct = 0
        for x, y in train_dataset:
            self.optim.zero_grad()
            y_hat = self(x)
            loss = F.nll_loss(y_hat, y)
            loss.backward()
            self.optim.step()
            train_loss += loss.item()
            pred = y_hat.data.max(1, keepdim=True)[1]
            correct += pred.eq(y.view_as(pred)).cpu().sum().item()
        train_loss /= (len(train_dataset))
        train_accuracy = (100. * correct) / len(train_dataset.dataset)
        return train_loss, train_accuracy

    def validate(self, valid_dataset):
        self.eval()
        valid_loss = 0
        correct = 0
        with torch.no_grad():
            for x, y in valid_dataset:
                y_hat = self(x)
                valid_loss += F.nll_loss(y_hat, y, reduction="sum").item()
                pred = y_hat.max(1, keepdim=True)[1]
                correct += pred.eq(y.view_as(pred)).cpu().sum().item()
        valid_loss /= len(valid_dataset.dataset)
        valid_accuracy = (100. * correct) / len(valid_dataset.dataset)
        return valid_loss, valid_accuracy


def train_model(uid, train_x, train_y, n_epochs, save_plot=False):
    model = TextClassifierNN()
    train_dataset, valid_dataset = create_train_loaders(train_x, train_y)
    train_losses, train_accuracies = [], []
    valid_losses, valid_accuracies = [], []
    print('Training epochs...')
    for e in range(n_epochs):
        print(f'epoch {e + 1}/{n_epochs}:', end=' ')

        # Train:
        t_loss, t_accuracy = model.learn(train_dataset)
        train_losses.append(t_loss)
        train_accuracies.append(t_accuracy)
        print(f'train loss: {str(round(t_loss, 4))}', end=', ')
        print(f'train accuracy: {str(round(t_accuracy, 2))}%', end=', ')

        # Validate:
        v_loss, v_accuracy = model.validate(valid_dataset)
        valid_losses.append(v_loss)
        valid_accuracies.append(v_accuracy)
        print(f'valid loss: {str(round(v_loss, 4))}', end=', ')
        print(f'valid accuracy: {str(round(v_accuracy, 2))}%')

    print('Training completed!')
    torch.save(model.state_dict(), f'./model_uid_{uid}')
    if save_plot:
        plot(train_losses, valid_losses, train_accuracies, valid_accuracies)
        print('Charts of losses and accuracies were saved to PNG files.')


def predict(uid, test_x):
    descriptions, test_dataset = create_test_loader(test_x)
    model = TextClassifierNN()
    model.load_state_dict(torch.load(f'model_uid_{uid}'))
    model.eval()
    print('Calculating predictions...')
    predictions = []
    for t, x in zip(descriptions, test_dataset):
        y_hat = model(x).max(1, keepdim=True)[1].item()
        predictions.append((t, CLASSES[y_hat]))
    print('Predictions returned.')
    return predictions


# train_model(1234, './datasets/train_x.csv', './datasets/train_y.csv', 100)
# print(predict(1234, './datasets/test_x.csv'))
