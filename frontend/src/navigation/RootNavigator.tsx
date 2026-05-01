import { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'

import TabNavigator from './TabNavigator'
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen'

const Root = createNativeStackNavigator()
const ONBOARDING_KEY = 'onboarding_completed'
const DEV_FORCE_ONBOARDING = false  // 改成 false 關閉

export default function RootNavigator() {
  const [onboardingDone, setOnboardingDone] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then(value => {
      if (value === 'true') setOnboardingDone(true)
    })
  }, [])

  const showOnboarding = !onboardingDone || DEV_FORCE_ONBOARDING

  return (
    <Root.Navigator
      initialRouteName={showOnboarding ? 'Onboarding' : 'Main'}
      screenOptions={{ headerShown: false }}
    >
      <Root.Screen name="Onboarding" component={OnboardingScreen} />
      <Root.Screen name="Main" component={TabNavigator} />
    </Root.Navigator>
  )
}
