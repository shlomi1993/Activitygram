import React, { useLayoutEffect, useState, useEffect } from 'react';
import { FlatList, Platform } from 'react-native';
import { useHeaderHeight } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useData, useTranslation } from '../hooks';
import { IBigCard, ICategory } from '../constants/types';
import { Block, Image, Button, BigCard, Text } from '../components';
import { BASE_URL } from '../constants/appConstants';

const ForYou = () => {

  const data = useData();
  const { assets, sizes, colors, gradients } = useTheme();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useData();

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selected, setSelected] = useState<ICategory>();
  const [suggestions, setSuggestions] = useState({});

  useEffect(() => {
    const uid = user._id.toString();
    const uri = BASE_URL + `getInterestPrediction?uid=${uid}&k=${10}&userbased=${1}`
    fetch(uri)
      .then((result) => result.json())
      .then((json) => {
        let adjucted = [];
        let suggestionLists = {};
        for (const cat of json) {
          adjucted.push({
            id: cat.interest_id,
            name: cat.interest_name
          });
          fetch(BASE_URL + `getActivityPrediction?uid=${uid}&interest=${cat.interest_name}`)
            .then((result) => result.json())
            .then((activities) => {
              suggestionLists[cat.interest_id] = activities;
              // Activities recieved proparly, the question is how to store them in a hook and use them later...
              // Another question is how to show other random activities.
              // And another task to do is to define the operations beehind the "interest" and "not interest buttons"
            })
            .catch(() => { console.error(`Could not fetch offers for ${cat.interest_name} from DB.`); })
        }
        setCategories(adjucted);
      })
      .catch(() => {
        data.setCategories([]);
        console.error('Could not fetch interests from DB.');
      });
  }, []);

  useEffect(() => {
    setSelected(data?.categories[0]);
  }, []);

  useEffect(() => {
    const category = data?.categories?.find(
      (category) => category?.id === selected?.id,
    );
    const newArticles = data?.articles?.filter(
      (article) => article?.category?.id === category?.id,
    );
    setSuggestions(newArticles);
  }, [data, selected, setSuggestions]);


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
      {/* categories list */}
      <Block color={colors.card} row flex={0} paddingVertical={sizes.padding}>
        <Block scroll horizontal renderToHardwareTextureAndroid showsHorizontalScrollIndicator={false}
          contentOffset={{ x: -sizes.padding, y: 0 }}>
          {categories?.map((category) => {
            const isSelected = category?.id === selected?.id;
            return (
              <Button
                radius={sizes.m}
                marginHorizontal={sizes.s}
                key={`category-${category?.id}}`}
                onPress={() => setSelected(category)}
                gradient={gradients?.[isSelected ? 'primary' : 'light']}>
                <Text
                  p
                  bold={isSelected}
                  white={isSelected}
                  black={!isSelected}
                  transform="capitalize"
                  marginHorizontal={sizes.m}>
                  {category?.name}
                </Text>
              </Button>
            );
          })}
        </Block>
      </Block>

      {/* our data will be top 2 recommendations */}
      <FlatList
        data={suggestions}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => `${item?.id}`}
        style={{ paddingHorizontal: sizes.padding }}
        contentContainerStyle={{ paddingBottom: sizes.l }}
        renderItem={({ item }) => <BigCard {...item} />}
      />
    </Block>
  );
};

export default ForYou;
