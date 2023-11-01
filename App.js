import { Text, View, Image, TouchableOpacity, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {NavigationContainer, useRoute, useFocusEffect} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider} from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import { styles } from './estilos';
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/Feather';
import { Header } from './components/Header';
import { Main } from './screens/Main';
import axios from 'axios';
import Constants from 'expo-constants';
import { Hosts } from './screens/Hosts';
import { CreaHost } from './screens/CreateHost';
import { EditHost } from './screens/CreateHost';
import { Transbordo } from './screens/Transbordo';
import { Precarga } from './screens/Precarga';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';



const HostStack = createNativeStackNavigator();
const RegistroStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const url = 'https://192.168.101.23/transcerca/c_entregastra/';

const Registro = ({navigation}) => {
  const [cedula, setCedula] = useState('');
  const [host, setHost] = useState('');
  
  const uuid = Constants.deviceName;

  const onCedulaChange = (cedula) => {
    setCedula(cedula);
  }

  useFocusEffect(
    React.useCallback(() => {
      const verificaHost = async () => {
        try{
          await AsyncStorage.getItem('host').then((res) => {
            setHost(res);
            if(!res){
              navigation.navigate('Hosts');
            }else{
              console.log(host);
            }
          });
    
        }catch(error){
          console.log(error);
        }
    
      }
  
      verificaHost();
    },[host])
  );


  const handleRegistrar = async () => {

    if(cedula){
      try{
        await axios.post(host+'cedula', {
          cedula,
          uuid
        }).then(res => {
          if(res.data.success){
  
            AsyncStorage.setItem('cedula', cedula);
            AsyncStorage.setItem('nombre', res.data.nombre);
            AsyncStorage.setItem('codigo', res.data.codigo);
  
            alert(res.data.mensaje);
  
            navigation.navigate('Main');
  
          }else{
            alert(res.data.mensaje);
          }
        })
      }catch(error){
        console.log(error);
      }  
    }else{
      alert('Ingrese datos validos');
    }

  }

    useFocusEffect(
      React.useCallback(() => {
        if(host){
          AsyncStorage.getItem('cedula').then((res) => {
            if(res){
              navigation.navigate('Main');
            }
          })  
        }    
      }, [host])
    )

  return (
    <View style = {{flex: 1}}>
      <LinearGradient
        colors={['#23f135', '#353f6b']}
        start = {[0,0]}
        end   = {[1,1]}
        style = {{ flex: 1 }}>

        <View style = {styles.container}>          
          <Image 
            source ={require('./assets/logo-transcerca-blanco-06.png')}
            style ={styles.logo}
            resizeMode ='contain'
          />
          <TextInput 
            style ={styles.input}
            placeholder="Cedula"
            placeholderTextColor="white"                     
            value = {cedula}
            onChangeText={onCedulaChange}
          />
        <Button title='Registrar' onPress = {handleRegistrar} />
        </View>

      </LinearGradient>
 
    </View>
  );
}

const HostScreens = () => {
  return(
    <HostStack.Navigator>
      <HostStack.Screen name = 'Hosts' component={Hosts} options = {{header: () => <Header titulo = "TRANSCERCA"/>,}}  />
      <HostStack.Screen name = 'Ehost' component={EditHost} options = {{header: () => <Header titulo = "TRANSCERCA"/>,}}  />
      <HostStack.Screen name = 'Chost' component={CreaHost}  options = {{header: () => <Header titulo = "TRANSCERCA"/>,}}  />
    </HostStack.Navigator>
  )
}

const RegistroScreens = () => {
  return(
      <RegistroStack.Navigator>
        <RegistroStack.Screen name = 'Registro' component={Registro} options = {{headerShown: false, statusBarHidden:true,   header: () => <Header titulo = "TRANSCERCA" />,}} />
        <RegistroStack.Screen name = 'Hosts' component={Hosts} options = {{header: () => <Header titulo = "TRANSCERCA" />,}}  />
        <RegistroStack.Screen name = 'Ehost' component={EditHost} options = {{header: () => <Header titulo = "TRANSCERCA" />,}}  />
        <RegistroStack.Screen name = 'Chost' component={CreaHost}  options = {{header: () => <Header titulo = "TRANSCERCA" />,}}  />
      </RegistroStack.Navigator>
  )
}


const MainTabs = () => {
  return(
    <Tab.Navigator>
      <Tab.Screen name = 'Entregas' component={Main}
        options = {{
          header: () => <Header titulo = "TRANSCERCA" />,
          tabBarLabel:'Entregas',
          tabBarIcon: ({ color, size }) => (
            <Icon name='check' color={color} size={size} />
          ),  
          tabBarHideOnKeyboard: true,}}   
      />
      
      <Tab.Screen name = 'Transbordo' component={Transbordo}
        options = {{
          header: () => <Header titulo = "TRANSCERCA" />,
          tabBarLabel:'Transbordo',
          tabBarIcon: ({ color, size }) => (
            <Icon name='truck' color={color} size={size} />
          ),  
          tabBarHideOnKeyboard: true,}}   
      />

      <Tab.Screen name = 'Precarga' component={Precarga}
        options = {{
          header: () => <Header titulo = "TRANSCERCA" />,
          tabBarLabel:'Precarga',
          tabBarIcon: ({ color, size }) => (
            <Icon name='package' color={color} size={size} />
          ),  
          tabBarHideOnKeyboard: true,}}   
      />
      
      <Tab.Screen name = 'HostsS' component={HostScreens}
        options = {{
          headerShown:false,
          tabBarLabel:'Hosts',
          tabBarIcon: ({ color, size }) => (
            <Icon name='server' color={color} size={size} />
          ),  
          tabBarHideOnKeyboard: true,}}   
      />
      

    </Tab.Navigator>
  )
}

const PrincipalStack = createNativeStackNavigator();

const Principal = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <PrincipalStack.Navigator>
          <PrincipalStack.Screen name = 'Registros' component={RegistroScreens} options = {{headerShown: false,}}  />
          <PrincipalStack.Screen name = 'Main' component={MainTabs} options = {{headerShown: false,}}  />

        </PrincipalStack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default Principal;