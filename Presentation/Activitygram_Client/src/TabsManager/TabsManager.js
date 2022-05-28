import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from '../screens/profile'
import EventList from '../screens/eventList'
import Event from '../screens/event'
import Setting from '../screens/setting'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import SettingOption from '../screens/setting/Options'
import { Components } from '../newScreens';

<style>
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300&display=swap');
</style>

const SettingStack = createNativeStackNavigator()
function SettingsStackScreen() {
  return (
    <SettingStack.Navigator>
      <SettingStack.Screen name="Settings" component={Setting} />
      <SettingStack.Screen name="Options" component={SettingOption} />
    </SettingStack.Navigator>
  )
}

const EventStack = createNativeStackNavigator()
function EventStackScreen() {
  return (
    <EventStack.Navigator>
      <EventStack.Screen name="Event" component={Event} />
    </EventStack.Navigator>
  )
}

const ProfileStack = createNativeStackNavigator()
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <ProfileStack.Screen name="Profile" component={Profile} />
    </ProfileStack.Navigator>
  )
}

const EventListStack = createNativeStackNavigator()
function EventListStackScreen() {
  return (
    <EventListStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <EventListStack.Screen name="EventList" component={EventList} />
    </EventListStack.Navigator>
  )
}

const ComponentsStack = createNativeStackNavigator()
function ComponentsStackScreen() {
  return (
    <ComponentsStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <ComponentsStack.Screen name="Components" component={Components} />
    </ComponentsStack.Navigator>
  )
}

const Tab = createBottomTabNavigator()

const HomeIcon = ({ focused, tintColor }) => (
  <Icon
    name="lens"
    type="material"
    size={26}
    color={focused ? '#adacac' : '#ededed'}
  />
)

class TabsManager extends React.Component {

    render() {
    return (
      <Tab.Navigator 
        screenOptions={({ route }) => ({
          tabBarIcon: props => <HomeIcon {...props}/>
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
          showLabel: false,
          showIcon: true,
          indicatorStyle: {
            backgroundColor: 'transparent',
          },
          labelStyle: {
            fontSize: 12,
          },
          iconStyle: {
            width: 30,
            height: 30,
          },
          style: {
            // backgroundColor: 'transparent',
            justifyContent: 'center',
          },
        }}
      >
        <Tab.Screen name="Profile" component={ProfileStackScreen} />
        <Tab.Screen name="Event" component={EventStackScreen} />
        <Tab.Screen name="EventList" component={EventListStackScreen} />
        <Tab.Screen name="Settings" component={SettingsStackScreen} />
        <Tab.Screen name="Components" component={ComponentsStackScreen} />
      </Tab.Navigator>
    );
  }

}


export default TabsManager;
