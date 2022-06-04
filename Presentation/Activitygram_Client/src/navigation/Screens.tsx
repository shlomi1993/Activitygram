import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {Components, Home, Profile, Post, Search, Explore } from '../newScreens';
import {useScreenOptions, useTranslation} from '../hooks';
import Event from '../screens/event'
const Stack = createStackNavigator();
const HomeStack = createStackNavigator();
const ComponentsStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const PostStack = createStackNavigator();
const SearchStack = createStackNavigator();
const ExploreStack = createStackNavigator();
const Tab = createBottomTabNavigator();
// const {t} = useTranslation();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={Home}/>
    </HomeStack.Navigator>
  )
}

function ComponentsStackScreen() {
  return (
    <ComponentsStack.Navigator>
      <ComponentsStack.Screen name="Components" component={Components} />
    </ComponentsStack.Navigator>
  )
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={Profile} />
    </ProfileStack.Navigator>
  )
}

function PostStackScreen() {
  return (
    <PostStack.Navigator>
      <PostStack.Screen name="Post" component={Post} />
    </PostStack.Navigator>
  )
}

function SearchStackScreen() {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="Search" component={Search} />
    </SearchStack.Navigator>
  )
}

function ExploreStackScreen() {
  return (
    <ExploreStack.Navigator>
      <ExploreStack.Screen name="Explore" component={Explore} />
    </ExploreStack.Navigator>
  )
}

export default () => {
  const {t} = useTranslation();
  const screenOptions = useScreenOptions();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeStackScreen} />
        <Tab.Screen name="Explore" component={ExploreStackScreen}/>
        <Tab.Screen name="Post" component={PostStackScreen}/>
        <Tab.Screen name="Search" component={SearchStackScreen}/>
        <Tab.Screen name="Profile" component={ProfileStackScreen}/>
        <Tab.Screen name="Components" component={ComponentsStackScreen} options={screenOptions.components} />
    </Tab.Navigator>
  );
};