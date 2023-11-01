import { StyleSheet, Text, View, Image, ImageBackground, TouchableOpacity, Button, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { echost } from '../estilos'

export const CreaHost = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [host,   setHost]   = useState('');
    const [proteo, setProteo] = useState('');
    const [protocolo, setProtocolo] = useState('');
    const [lista,  setLista]  = useState([
        {id: 1, nombre: 'Transcerca Externo', host: 'http://drocerca.proteoerp.org:52001/transcerca/c_entregastra/'}
    ]);

    useEffect(() => {
        async function obtenerDatos() {
            const listaGuardada = await AsyncStorage.getItem('lista');
            if (listaGuardada !== null) {
                setLista(JSON.parse(listaGuardada));
            }
        }
        obtenerDatos();
    }, [lista]);

    useEffect(() => {
        console.log(lista);
    },[])

    const guardaHost = () => {
        const nuevoHost = {id: lista.length +1 , nombre: nombre, host: protocolo+host+'/'+proteo+'/'};
        setLista(prevLista => [...prevLista, nuevoHost]);

        AsyncStorage.setItem('lista', JSON.stringify([...lista, nuevoHost]));
        
        console.log(nuevoHost);
        alert('Host agregado');

        navigation.navigate('Hosts');
        
    }

    return(
        <View style = {{flex:1}}>
            <View style = {{backgroundColor: '#003466', alignItems: 'center', padding: 5}}>
                <Text style = {{fontSize: 16, fontWeight: '500', color: '#FFF'}}>Creacion de Host</Text>
                <Image source={require('../assets/Proteoblanco.png')} style = {{height: 80, width: 350}} />
            </View>

            <View style = {{padding:10}}>
                <TextInput 
                style = {echost.input}
                placeholder = 'Nombre'
                value={nombre}
                onChangeText = {setNombre}
                />

                <TextInput 
                style = {echost.input}
                placeholder = 'Direccion del servidor'
                value={host}
                onChangeText = {setHost}
                />

                <TextInput 
                style = {echost.input}
                placeholder = 'Direccion Proteo'
                value={proteo}
                onChangeText = {setProteo}
                />


                <Picker
                selectedValue={protocolo}
                style = {{borderWidth: 2, borderColor: 'red'}}
                itemStyle = {echost.item}
                onValueChange = {(item) =>
                    setProtocolo(item)
                }>
                  <Picker.Item label='Seleccione un Protocolo' value='' />
                  <Picker.Item label='HTTP'  value='http://'  />
                  <Picker.Item label='HTTPS' value='https://' />
                </Picker>

                

                <View style = {{flexDirection: 'row', justifyContent: 'space-between'}} >
                    <TouchableOpacity style = {echost.button} onPress = {guardaHost}>
                        <Text style = {echost.buttonText} > Crear Host </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style = {[echost.button, {backgroundColor: 'red'}]} onPress = {() => navigation.navigate('Hosts')}>
                        <Text style = {echost.buttonText} > Volver </Text>
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    )
}

export const EditHost = ({navigation, route}) => {
    const {host, nombre, id}= route.params;
    const [nnombre, setNnombre] = useState(nombre);
    const [nhost ,  setNhost]   = useState(host);

    useEffect(() => {
      console.log(host, nombre, id);
    },[])
    const changeHost = () => {
      const newNombre = nnombre.trim();
      const newHost   = nhost.trim();

      //Obtener la lista de async storage
      AsyncStorage.getItem('lista').then((res) => {
        if(res){
          const parsedList = JSON.parse(res);
          //Actualizar el host seleccionado con los nuevos valores
          const updatedList = parsedList.map((item) => {
            if(item.id === id){
              return{
                ...item,
                nombre:newNombre,
                host:newHost,
              };
            }else{
              return item;
            }
          });
          //Guardar la lista actualizada
          AsyncStorage.setItem('lista', JSON.stringify(updatedList)).then(() =>{
            navigation.navigate('Hosts');
          })
        }
      })
    }


    return(
      <View style = {{flex:1}}>
      <View style = {{backgroundColor: '#003466', alignItems: 'center', padding: 5}}>
          <Text style = {{fontSize: 16, fontWeight: '500', color: '#FFF'}}>Edicion de Host</Text>
          <Image source={require('../assets/Proteoblanco.png')} style = {{height: 80, width: 350}} />
      </View>

      <View style = {{padding:10}}>
          <TextInput 
          style = {echost.input}
          placeholder = 'Nombre'
          value={nnombre}
          onChangeText = {setNnombre}
          />

          <TextInput 
          style = {echost.input}
          placeholder = 'Direccion del servidor'
          value={nhost}
          onChangeText = {setNhost}
          />          

          <View style = {{flexDirection: 'row', justifyContent: 'space-between'}} >
              <TouchableOpacity style = {echost.button} onPress = {changeHost}>
                  <Text style = {echost.buttonText} > Guardar Cambios </Text>
              </TouchableOpacity>

              <TouchableOpacity style = {[echost.button, {backgroundColor: 'red'}]} onPress = {() => navigation.navigate('Hosts')}>
                  <Text style = {echost.buttonText} > Volver </Text>
              </TouchableOpacity>
          </View>
      </View>

  </View>
    )

}