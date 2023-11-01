import { StyleSheet, Text, View, Image, ImageBackground, TouchableOpacity, Button, Alert, TextInput, SliderBase } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import { ehost } from '../estilos';
import axios from 'axios';

export const Hosts = ({ navigation }) => {
    const [host, setHost]   = useState('');
    const [lista, setLista] = useState([
      {id: 1, nombre: 'Transcerca Externo', host: 'http://transcerca.proteoerp.org:7085/transcerca/c_entregastra/'}
    ]);
    const [sbuttons, setSbuttons] = useState(false);
    const [selectedHost, setSelectedHost] = useState(null);

    useEffect(() => {
      AsyncStorage.setItem('lista', JSON.stringify(lista));
    }, []);

    useFocusEffect(
        React.useCallback(() => {
          AsyncStorage.getItem('lista').then((res) => {
            if (res) {
              const parsedList = JSON.parse(res);
              setLista(parsedList);
              //console.log(parsedList);
            }
          });
        }, [])
      );
      
    const changeHost = (host) =>{
        setHost(host);
        AsyncStorage.setItem('host', host);
        navigation.navigate('Registro');
        Alert.alert('Exito', host+' Seleccionado');
        
    }

    const showButtons = (host) => {
      if(sbuttons){
        setSbuttons(false);
      }else{
        setSbuttons(true);
        setSelectedHost(host);
      }
      
      

    }

    const handleProbar = (host) => {
      axios.post(host+'probar').then(res => {
        if(res.data.success){
         Alert.alert('Exito', res.data.mensaje);
        }
      }).catch(error => { Alert.alert('Error', 'No se ha podido conectar al host') })
    }

    const handleDelete = (id) => {
      const updatedList = lista.filter(item => item.id !== id);
      setLista(updatedList);
      AsyncStorage.setItem('lista', JSON.stringify(updatedList));
    }

    const handleEdit = (item)=> {
      //console.log(item);
      navigation.navigate('Ehost', item);
    }

    return (
        <View style = {{flex: 1}}>
             <View style = {{backgroundColor: '#003466', alignItems: 'center', padding: 5}}>
                <Text style = {{fontSize: 16, fontWeight: '500', color: '#FFF'}}>Seleccion de Host</Text>
                <Image source={require('../assets/Proteoblanco.png')} style = {{height: 80, width: 350}} />
            </View>
            
            <View style = {{padding: 10}}>
                <Text style = {ehost.text}>*Para crear un Host, haga click en el boton del + abajo a la derecha</Text>

                <FlatList
                data = {lista}
                renderItem = {({item}) => (
                  <View style = {{flex:1}}>
                    <View style = {ehost.cardContainer}>
                        <TouchableOpacity onPress = {() => showButtons(item.host)}>
                            <Text style = {ehost.cardTitle}>{item.nombre}</Text>
                            <Text style = {ehost.cardText}>{item.host}</Text>
                        </TouchableOpacity>
                        {sbuttons && selectedHost === item.host && (
                          <View style = {ehost.buttonsContainer}>
                            <TouchableOpacity style = {[ehost.button, {backgroundColor: '#217a20', borderRadius: 5}]} onPress = {() => changeHost(item.host)}>
                              <Text style = {ehost.buttonText}>Selecc.</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {[ehost.button, {backgroundColor: '#003466', borderRadius: 5}]} onPress = {() => handleEdit(item)}>
                                <Text style = {ehost.buttonText}>Modific.</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {[ehost.button, {backgroundColor: '#f4fc00', borderRadius: 5}]} onPress = {() => handleProbar(item.host)}>
                                <Text style = {ehost.buttonText}>Probar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {[ehost.button, {backgroundColor: '#c42525', borderRadius: 5}]} onPress = {() => handleDelete(item.id)}>
                              <Text style = {ehost.buttonText}>Elim.</Text>
                            </TouchableOpacity>

                         </View>
                        )}
                       
                    </View>
                  </View>
                    
                )}
                keyExtractor = {(item) => item.id}
                />
            </View>

            <TouchableOpacity
            style = {ehost.floatingButton} 
            onPress = {() => navigation.navigate('Chost')}
            >
                <Text style = {{color: '#fff',fontSize: 28,fontWeight: 'bold'}}>+</Text>
            </TouchableOpacity>

        </View>
    )
}


