import React, { useLayoutEffect, useState } from 'react';
import { Platform, FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';
import { IEventForm } from '../constants/types/forms';
import { useTheme } from '../hooks';
import { Block, Image, Text, Input, Button } from '../components';
import 'react-native-gesture-handler';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Moment from 'moment';
import { TextInput } from 'react-native-paper';
import Switch from '../components/Switch'
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
// import BingMapsView from 'react-native-bing-maps';

export const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8080/' : 'http://127.0.0.1/8080/';

async function sendNewActivity(params) {
  let formBody: any;
  for (var property in params) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(params[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  formBody = formBody.join('&');
  await fetch(baseUrl + 'createActivity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: formBody
  })
    .then((res) => {
      console.log('sent request');
    })
    .catch((err) => {
      console.log('error');
    });
}

const Form = () => {
  const { assets, colors, sizes, gradients } = useTheme();
  const [form, setForm] = useState<IEventForm>();

  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [startDate, setStartDate] = useState('')
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [startTime, setStartTime] = useState('')
  const [startTimeDisable, setStartTimeDisable] = useState(true)
  const [startDateError, setStartDateError] = useState(false)
  const [startTimeError, setStartTimeError] = useState(false)

  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [endDate, setEndDate] = useState('')
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [endTime, setEndTime] = useState('')
  const [endTimeDisable, setEndTimeDisable] = useState(true)
  const [endDateError, setEndDateError] = useState(false)
  const [endTimeError, setEndTimeError] = useState(false)

  const [recurrentSwitch, setRecurrentSwitch] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);


  const createDateObject = (date, time) => {
    let dateArray = date.split(', ')[1].split('.')
    let timeArray = time.split(':')
    let sY = Number(dateArray[2])
    let sM = Number(dateArray[1]) - 1
    let sD = Number(dateArray[0])
    let sh = Number(timeArray[0])
    let sm = Number(timeArray[1])
    return new Date(sY, sM, sD, sh, sm)
  }

  const handleStartDateConfirm = (date) => {
    Moment.locale('en');
    if (endDate) {
      let end = createDateObject(endDate, '23:59')
      if (end < date) {
        setStartDateError(true)
        setEndDateError(true)
      } else {
        setStartDateError(false)
        setEndDateError(false)
      }
    }
    let newText = Moment(date).format('ddd, D.M.YYYY');
    setStartDate(newText);
    setStartTimeDisable(false)
    setStartDatePickerVisibility(false);
  };

  const handleStartTimeConfirm = (time) => {
    Moment.locale('en');
    let newText = Moment(time).format('HH:mm');
    if (endTime) {
      let end = createDateObject(endDate, endTime);
      let start = createDateObject(startDate, newText);
      if (end < start) {
        setStartTimeError(true)
        setEndTimeError(true)
      } else {
        setStartTimeError(false)
        setEndTimeError(false)
      }
    }
    setStartTime(newText);
    setStartTimePickerVisibility(false);
  };

  const handleEndDateConfirm = (date) => {
    if (startDate) {
      let start = createDateObject(startDate, '00:00')
      if (start > date) {
        setStartDateError(true)
        setEndDateError(true)
      } else {
        setStartDateError(false)
        setEndDateError(false)
      }
    }
    Moment.locale('en');
    let newText = Moment(date).format('ddd, D.M.YYYY');
    setEndDate(newText);
    setEndTimeDisable(false)
    setEndDatePickerVisibility(false);
  };

  const handleEndTimeConfirm = (time) => {
    Moment.locale('en');
    let newText = Moment(time).format('HH:mm');
    if (startTime) {
      let end = createDateObject(endDate, newText);
      let start = createDateObject(startDate, endTime);
      if (end < start) {
        setStartTimeError(true)
        setEndTimeError(true)
      } else {
        setStartTimeError(false)
        setEndTimeError(false)
      }
    }
    setEndTime(newText);
    setEndTimePickerVisibility(false);
  };

  return (

    <Block

      color={colors.card}
      paddingTop={sizes.m}
      paddingHorizontal={sizes.padding}>

      <Text p semibold marginBottom={sizes.s}>
        Please fill details below
      </Text>

      <Block>

        <Block marginBottom={sizes.sm}>
          <Input value={'Initiator placeholder'} editable={false} disabled />
        </Block>

        <AutocompleteDropdown
          clearOnFocus={false}
          closeOnBlur={true}
          closeOnSubmit={false}
          initialValue={{ id: '2' }} // or just '2'
          onSelectItem={setSelectedCategory}
          dataSet={[
            { id: '1', title: 'Alpha' },
            { id: '2', title: 'Beta' },
            { id: '3', title: 'Gamma' },
            { id: '4', title: 'Delta' }
          ]}
        />

        <Block marginBottom={sizes.sm} marginTop={sizes.sm}>
          <TextInput label='Activity title' mode='outlined' autoComplete={false}
            onChangeText={(newText) => {
              setForm(prevState => ({ ...prevState, title: newText }));
            }}
          />
        </Block>

        <Block row marginBottom={sizes.sm}>

          <Block marginRight={sizes.sm / 2}>
            <TextInput label='Start date' mode='outlined' autoComplete={false} showSoftInputOnFocus={false} error={startDateError}
              onPressIn={() => setStartDatePickerVisibility(true)} value={startDate} />
          </Block>

          <Block marginLeft={sizes.sm / 2}>
            <TextInput label='Start time' mode='outlined' autoComplete={false} showSoftInputOnFocus={false} disabled={startTimeDisable} error={startTimeError}
              onPressIn={() => setStartTimePickerVisibility(true)} value={startTime} />
          </Block>

          <DateTimePickerModal
            isVisible={isStartDatePickerVisible}
            mode="date"
            onConfirm={handleStartDateConfirm}
            onCancel={() => setStartDatePickerVisibility(false)}
          />

          <DateTimePickerModal
            isVisible={isStartTimePickerVisible}
            mode="time"
            onConfirm={handleStartTimeConfirm}
            onCancel={() => setStartTimePickerVisibility(false)}
          />

        </Block>

        <Block row marginBottom={sizes.sm}>

          <Block marginRight={sizes.sm / 2}>
            <TextInput label='End date' mode='outlined' autoComplete={false} showSoftInputOnFocus={false} error={endDateError}
              onPressIn={() => setEndDatePickerVisibility(true)} value={endDate} />
          </Block>

          <Block marginLeft={sizes.sm / 2}>
            <TextInput label='End time' mode='outlined' autoComplete={false} showSoftInputOnFocus={false} disabled={endTimeDisable} error={endTimeError}
              onPressIn={() => setEndTimePickerVisibility(true)} value={endTime} />
          </Block>

          <DateTimePickerModal
            isVisible={isEndDatePickerVisible}
            mode="date"
            onConfirm={handleEndDateConfirm}
            onCancel={() => setEndDatePickerVisibility(false)}
          />

          <DateTimePickerModal
            isVisible={isEndTimePickerVisible}
            mode="time"
            onConfirm={handleEndTimeConfirm}
            onCancel={() => setEndTimePickerVisibility(false)}
          />

        </Block>

        <Block row flex={0} align="center" justify="space-between" marginBottom={sizes.s}>
          <Text>Recurrent:</Text>
          <Block row flex={0}>
            <Text>{recurrentSwitch ? 'Yes   ' : 'No    '}</Text>
            <Switch checked={recurrentSwitch} onPress={(checked) => setRecurrentSwitch(checked)} />
          </Block>

        </Block>

        <Block marginBottom={sizes.sm}>
          <TextInput label='Location' mode='outlined' autoComplete={false}
            onChangeText={(newText) => {
              // Read mode: https://github.com/GeekyAnts/react-native-bing-maps
              let fixedLocation = { lat: 12.9010875, long: 77.6095084, zoom: 15 }  // Need to set-up Bing maps!
              setForm(prevState => ({ ...prevState, geolocation: fixedLocation }));
            }}
          />
        </Block>

        {/* <BingMapsReact
          bingMapsKey="AqdHYN8WZH0xzQR9RGgb264VJl087NRvLrj4tAwT292vwuakZhx2HuKiN_UR2kzS"
          height="500px"
          mapOptions={{
            navigationBarMode: "square",
          }}
          width="500px"
          viewOptions={{
            center: { latitude: 42.360081, longitude: -71.058884 },
            mapTypeId: "grayscale",
          }}
        /> */}

        <Block marginBottom={sizes.sm}>
          <TextInput label='Description' mode='outlined' autoComplete={false} multiline={true} numberOfLines={7}
            onChangeText={(newText) => {
              setForm(prevState => ({ ...prevState, description: newText }));
            }}
          />
        </Block>


        {/* <Input placeholder="Start time" marginBottom={sizes.sm}
          onChangeText={(newText) => {
            setForm(prevState => ({ ...prevState, startTime: newText }));
          }} />
        <Input placeholder="End time" marginBottom={sizes.sm} onChangeText={(newText) => {
          setForm(prevState => ({ ...prevState, endTime: newText }));
        }} />
        <Input placeholder="Recurrent" marginBottom={sizes.sm} onChangeText={(newText) => {
          setForm(prevState => ({ ...prevState, recurrent: newText }));
        }} />
        <Input placeholder="Location" marginBottom={sizes.sm} onChangeText={(newText) => {
          setForm(prevState => ({ ...prevState, location: newText }));
        }} />
        <Input placeholder="Description" marginBottom={sizes.sm} onChangeText={(newText) => {
          setForm(prevState => ({ ...prevState, description: newText }));
        }} />
        <Input placeholder="Interests" marginBottom={sizes.sm} onChangeText={(newText) => {
          setForm(prevState => ({ ...prevState, interests: newText }));
        }} />
        <Input placeholder="Preconditions" marginBottom={sizes.sm} onChangeText={(newText) => {
          setForm(prevState => ({ ...prevState, preconditions: newText }));
        }} />
        <Input placeholder="Initiator" marginBottom={sizes.sm} onChangeText={(newText) => {
          setForm(prevState => ({ ...prevState, initiator: newText }));
        }} />
        <Input placeholder="Managers" marginBottom={sizes.sm} onChangeText={(newText) => {
          setForm(prevState => ({ ...prevState, managers: newText }));
        }} />
        <Input placeholder="Invited" marginBottom={sizes.sm} onChangeText={(newText) => {
          setForm(prevState => ({ ...prevState, invited: newText }));
        }} />
        <Input placeholder="Images" marginBottom={sizes.sm} onChangeText={(newText) => {
          setForm(prevState => ({ ...prevState, images: newText }));
        }} />
        <Input placeholder="QR" marginBottom={sizes.sm} onChangeText={(newText) => {
          setForm(prevState => ({ ...prevState, QR: newText }));
        }} />
        <Input placeholder="Tags" marginBottom={sizes.sm} onChangeText={(newText) => {
          setForm(prevState => ({ ...prevState, tags: newText }));
        }} />
        <Input placeholder="Status" marginBottom={sizes.sm} onChangeText={(newText) => {
          setForm(prevState => ({ ...prevState, status: newText }));
        }} /> */}
        <Block paddingHorizontal={sizes.padding}>
          <Button flex={1} gradient={gradients.info} marginBottom={sizes.base} onPress={() => {
            console.log('clicked');
            sendNewActivity(form);
          }}>
            <Text white bold transform="uppercase">
              Create
            </Text>
          </Button>
        </Block>
      </Block>
    </Block >
  );
};

const Post = () => {
  const { assets, sizes } = useTheme();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackground: () => (
        <Image
          radius={0}
          resizeMode="cover"
          width={sizes.width}
          height={headerHeight}
          source={assets.background}
        />
      ),
    });
  }, [assets.background, navigation, sizes.width, headerHeight]);

  return (
    <Block safe>
      <Block scroll>
        <Form />
      </Block>
    </Block>
  );
};

export default Post;
