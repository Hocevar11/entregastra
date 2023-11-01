import { StyleSheet, View, Image, ImageBackground, TouchableOpacity, Dimensions, Vibration, Alert} from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Camera, CameraType } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';
import { emain } from '../estilos';
import BarcodeMask from 'react-native-barcode-mask';
import { ScrollView } from 'react-native-gesture-handler';
import ReactNativeLoadingSpinnerOverlay from 'react-native-loading-spinner-overlay';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';

import { Modal, Snackbar, Button, Portal, Dialog, Text} from 'react-native-paper';
import { Center, CheckIcon, NativeBaseProvider, Select, VStack, HStack, Toast, Text as NText, useToast, Button as Nbutton} from 'native-base';


const { width, height } = Dimensions.get('window');
const maskSize = Math.min(width, height) * 0.6;

const url = 'http://192.168.101.23/transcerca/c_entregastra/';

export const Transbordo = () => {
    //Para la validacion del usuario
    const [cedula,   setCedula]   = useState('');
    const [nombre,   setNombre]   = useState('');
    const [codigo,   setCodigo]   = useState('');
    const [host,     setHost]     = useState('');
    const [location, setLocation] = useState(null);
    const [destino,  setDestino]  = useState('');
    const [destinoOptions, setDestinoOptions] = useState([]);
    const [showFacturas, setShowFacturas] = useState({});
    const [visibleRepartos, setVisibleRepartos] = useState({});
    const [scanguia, setScanGuia] = useState(false);
    const [snackbarMessage,setMessage] = useState('');

    //Manejo y propiedades del modal
    const [modalOpen,setOpenModal] = useState(false);
    const [modalMsj, setModalMsj] = useState([]);
    
    

    const toast = useToast();
    const id    = 'toast1';


    


    //Para la camara y permisos
    const [type, setType] = useState(CameraType.back);
    const [hasPermission, setHasPermission] = useState(null);
    const [locPermission, setLocPermission] = useState(null);

    const [cameraVisible, setCameraVisible] = useState(false);
    
    //Para la lista de los escaneados
    const [scanned, setScanned] = useState(false);
    const [dataList2, setDataList2] = useState([]);

    //Pantalla de carga
    const[loading, isLoading]= useState(false);
    const vibracion = [500, 100];

    

    //************************************************************************
    //Funcion que se ejecuta cuando se escanea un codigo de barras de un bulto
    //************************************************************************
    const handleBarcodeScanned = ({ bounds, data }) => {

      if(dataList2 !== null){
        const index = dataList2.findIndex((item) => item.code === data);

        if(index !== -1){
          //setScanned(true);

          if(dataList2[index].observa > 0){
            setMessage('No se puede escanear un bulto con observacion');
            return; 
          }

          if(dataList2[index].verificado){
            setMessage('Ya escaneado');

          }else{
            const updatedItem = {
              ...dataList2[index],
              date: new Date().toLocaleString('es-ES'),
              user: codigo,
              transbordo: destino, 
              location: location.coords.latitude+' '+location.coords.longitude,
              verificado: true,
            };  
            const newDataList = [...dataList2];
            newDataList[index] = updatedItem;
            setDataList2(newDataList);
            setMessage('Escaneado Correctamente');
            Vibration.vibrate(vibracion);
            
          }

        }else{
          setMessage('Codigo de barras invalido');

        }           
      }else{
        setDataList2([]);
      }          
    };




   //****************************************
    //Muestra la lista de repartos descargados 
    //****************************************
    const renderDataList = () => {

      if(!dataList2){
        return null; 
      }

      const toggleReparto = (reparto) => {
        setVisibleRepartos((prevShowRepartos) => {
          return {...prevShowRepartos, [reparto]: !prevShowRepartos[reparto]};
        });
      };  

      const toggleShowFacturas = (cliente) => {
        setShowFacturas((prevShowFacturas) => {
          return {...prevShowFacturas, [cliente]: !prevShowFacturas[cliente]};
        });
      };


      const sortedData = dataList2.sort((a,b) => a.reparto.localeCompare(b.reparto));



      const groupedData = sortedData.reduce((result, data) => {
        if(!result[data.reparto]){
          result[data.reparto] = {};
        }

        if(!result[data.reparto][data.nombre]){
          result[data.reparto][data.nombre] = {data : [], totalBultos: 0, verificados:0, noVerificados: 0};
        }
        result[data.reparto][data.nombre].data.push(data);
        result[data.reparto][data.nombre].totalBultos += Number(data.bultos);

        if(data.verificado){
          result[data.reparto][data.nombre].verificados++;
        }else{
          result[data.reparto][data.nombre].noVerificados++;
        }

        return result;
      }, {});

      return Object.keys(groupedData).map((reparto) => (
        <View key= {reparto} style = {{padding: 5, elevation: 3, borderRadius: 20, backgroundColor:'#FFF', marginBottom: 15}}>
          <TouchableOpacity onPress={() => toggleReparto(reparto)}>
            <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 3, marginBottom: 5}}>Guia: {reparto}</Text>
          </TouchableOpacity>
          
          {visibleRepartos[reparto] &&
            Object.keys(groupedData[reparto]).map((cliente) => (
            <View key={cliente}>
            <View style = {{marginVertical: 2, paddingVertical: 3, borderRadius: 1, paddingHorizontal: 5, flexDirection:'row', justifyContent:'space-between'}}>
              <TouchableOpacity onPress = {() => toggleShowFacturas(cliente )}>
                <Text style = {{fontSize: 13, fontWeight: '700', marginTop: 5}}>{cliente}</Text>
              </TouchableOpacity>
             
            </View>
            {showFacturas[cliente] &&
              groupedData[reparto][cliente].data.map((data) => (
                <View key={data.id}>
                  <View style={emain.dataListItem}>
                    <Text style={emain.dataListItemText}>{data.pedido}</Text>
                    <Text style={emain.dataListItemText}>{data.bulto}</Text>
                    <Text style={emain.dataListItemText}>{data.date}</Text>

                    {data.verificado ? (
                      <Text style={[emain.dataListItemText, {backgroundColor: 'green', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 3}]}>S</Text>
                    ) : (
                      <Text style={[emain.dataListItemText, {backgroundColor: 'red', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 3}]}>N</Text>
                    )}
                    <Text style={[emain.dataListItemText, {backgroundColor: data.observa == 0 ? '#70a5fa' : 'yellow', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 3}]}>{data.observa == 0 ? 'E' : 'F'}</Text>

                  </View>
                </View>
                
              ))}
              {showFacturas[cliente] &&(
                <View style = {{marginVertical: 2, paddingVertical: 5, paddingHorizontal: 5, borderRadius: 5, flexDirection:'row', justifyContent:'space-around'}}>
                  <Text style = {{fontSize: 11, fontWeight: '600', }}>Total: {groupedData[reparto][cliente].totalBultos}</Text>
                  <Text style = {{fontSize: 11, fontWeight: '600', }}>Verificados: {groupedData[reparto][cliente].verificados}</Text>
                  <Text style = {{fontSize: 11, fontWeight: '600', }}>No verificados: {groupedData[reparto][cliente].noVerificados}</Text>
                </View>              
              )}
            </View>
          ))}
          {visibleRepartos[reparto] &&(
             <TouchableOpacity style = {{alignItems:'center', marginTop:10, marginBottom:5}}>
               <Text style = {{fontWeight:'500', textDecorationLine:'underline', fontSize:16}}>Cerrar Guia</Text>
             </TouchableOpacity>
          )}
          </View>
      ));
    };

    //********************************
    //Para eliminar la lista de bultos
    //********************************
    const Eliminar = () => {
      AsyncStorage.removeItem('scannedTransbordo');
      setDataList2([]);
    }

    //**********************************************************
    //Para escanear el codigo de barras de la guia y descargarla
    //**********************************************************
    const handleGuia = async ({bounds, data}) => {
      setScanned(true);
      setScanGuia(false);

      isLoading(true);

      try {
        const guiaId = data.substring(3);        

        const guiaExistente = dataList.find((reparto) =>  reparto.reporg === guiaId);
        if(guiaExistente){
          isLoading(false);

          const mensaje = {titulo: 'Atencion', cuerpo: 'La guia ya ha sido descargada'};
          setModalMsj(mensaje);
          setOpenModal(true);

          return; 
        }

        // Realizar la solicitud HTTP para descargar los repartos nuevamente
        const response = await axios.post(host + 'guias/' + data+'/T');
        const guia = response.data;

        console.log(guia);
    
        // Mapear los Guia descargados al formato esperado
        const nuevaGuia = guia.map((reparto) => ({
          id: reparto.id,
          date: '00/0/0000 00:00:00',
          code: reparto.barras,
          user: '',
          nombre: reparto.nombre,
          pedido: reparto.pedido,
          bulto: reparto.bulto,
          bultos: reparto.bultos,
          factura: reparto.factura,
          location: '',
          tipo: 'TR',
          verificado: false,
          reparto: reparto.reparto,
          observa: '0',
          reporg: reparto.reporg
        }));
    
        // Actualizar la lista de repartos con los nuevos repartos descargados
        setDataList2((prevDataList) => prevDataList.concat(nuevaGuia));
    
        isLoading(false);
        const mensaje = {titulo: 'Exito', cuerpo: 'Guia descargada exitosamente'};
        setModalMsj(mensaje);
        setOpenModal(true);
      } catch (error) {
        console.log(error);
        isLoading(false);
        const mensaje = {titulo: 'Error', cuerpo: 'Error al descargar la guia'};
        setModalMsj(mensaje);
        setOpenModal(true);
      }
    }


    const ToastAlert = () => {
      return <Center flex={1} px="3"> 
        <Alert maxWidth="100%" alignSelf="center" flexDirection="row" status= "info" variant='solid' zIndex='100000'>
            <VStack space={1} flexShrink={1} w="100%">
              <HStack flexShrink={1} alignItems="center" justifyContent="space-between">
                <HStack space={2} flexShrink={1} alignItems="center">
                  <Alert.Icon />
                  <NText fontSize="md" fontWeight="medium" flexShrink={1} color='lightText'>
                    Atencion
                  </NText>
                </HStack>
              </HStack>
              <NText px="6" color='lightText'>
                No hay facturas para enviar
              </NText>
            </VStack>
          </Alert>
        </Center>;
    }
    
    //*************************************************************************
    //Funcion que envia los bultos escaneados o con entrega fallida al servidor
    //*************************************************************************
    const sendDataList = async () => {

      isLoading(true);
      
      const facturasParaEnviar = dataList2.filter((factura) => factura.verificado === true);
      console.log(facturasParaEnviar);
    
      if (facturasParaEnviar.length === 0) {
        isLoading(false);

       /* Toast.show({
          placement: 'top',
          description: 'Hola sexo',
          render: () => {
            return <ToastAlert />
          }
        });*/

        const mensaje = {titulo: 'Atencion', cuerpo: 'No hay facturas para enviar por favor escanee un documento o bulto'};
        setModalMsj(mensaje);
        setOpenModal(true);
        return;
      }
    
      try {
        const response = await axios.post(host + 'transbordo', facturasParaEnviar);
    
        if (response.data.success) {
          const facturasNoEnviadas = dataList2.filter((factura) => factura.verificado === false);
          setDataList2(facturasNoEnviadas);
          isLoading(false);
    

          const mensaje = {titulo: 'Exito', cuerpo: response.data.mensaje};
          setModalMsj(mensaje);
          setOpenModal(true);

        } else {
          console.log(response.data);
          isLoading(false);

          const mensaje = {titulo: 'Error', cuerpo: response.data};
          setModalMsj(mensaje);
          setOpenModal(true);
        }
      } catch (error) {
        console.log(error);
        if (axios.isCancel(error)) {

          const mensaje = {titulo: 'Error', cuerpo: 'El envío de datos fue cancelado. Por favor, revise su conexión a internet.'};
          setModalMsj(mensaje);
          setOpenModal(true);
        } else {

          const mensaje = {titulo: 'Error', cuerpo: 'Ocurrió un error al enviar los datos. Por favor, revise su conexión a internet.'};
          setModalMsj(mensaje);
          setOpenModal(true);
        }
        isLoading(false);
      }
    };
    


    useEffect(() => {
        setScanned(true);             
        
        const getBarCodeScannerPermissions = async () => {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        };
    
        getBarCodeScannerPermissions();

        //Recuperar la data guardada
        AsyncStorage.getItem('scannedTransbordo').then((res) => setDataList2(JSON.parse(res)))
        
        
    }, [])


    //***************************************************************************************
    //Si la lista no es nula ingresa los datos de los bultos guardados, si no lo coloca vacio
    //***************************************************************************************
    useEffect(() => {
      if (dataList2 !== null) {
        AsyncStorage.setItem('scannedTransbordo', JSON.stringify(dataList2));
      }else{
        setDataList2([]);
      }
    }, [dataList2]);

    //***************************
    //Permisos de la localizacion
    //***************************
    useEffect(() => {
      (async () => {
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Error','No se han dado permisos para la localizacion');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        console.log(location.coords.latitude); 


      })();
    }, []);


    //****************************
    //Obtengo la lista de choferes 
    //****************************
    useEffect(() => {

      isLoading(true);
      fetch(host+'choferes')
      .then((response) => response.json())
      .then((json) =>{
          setDestinoOptions(json);
          isLoading(false);
      })
      .catch((error) => {
          console.log(error);
          isLoading(false);
      })

        AsyncStorage.getItem('cedula').then((res) => {
            setCedula(res);
            console.log(res);
        });
      
        AsyncStorage.getItem('nombre').then((res) => {
          setNombre(res);
          console.log(res);
        });
  
        AsyncStorage.getItem('codigo').then((res) => {
          setCodigo(res);
          console.log(res);
        });
  
        AsyncStorage.getItem('host').then((res) => {
          setHost(res);
          console.log(res);
        });
    }, [cedula, nombre, codigo, host]);


    //***********************************
    //Renderizo el componente de la lista 
    //***********************************
    const renderChoferes = () => {
        return destinoOptions.map(item => (
            <Select.Item key ={item.id} label = {item.nombre} value = {item.codigo}/>
          ));
          
    }

    //***************
    //Banner superior
    //***************
    const Incio = () => {
      return (
          <View style = {{backgroundColor: '#003466', alignItems: 'center', padding: 5}}>
            <Text style = {{fontSize: 16, fontWeight: '500', color: '#FFF'}}>Escaneo de Transbordo</Text>
            <Image source={require('../assets/Proteoblanco.png')} style = {{height: 80, width: 350}} />
          </View>
      )
    }


    //*******************
    //Renderiza la camara
    //*******************
    const renderCamera = () => {
      if(hasPermission === null){
          return <View />;
      }

      if(hasPermission === false) {
          return <Text>No access to camera</Text>;
      }
      return(
          <View style = {{flex: 1}}>
            <View style={emain.container}>
              <View style={emain.barcodebox}>
                <BarCodeScanner
                style={{ height: 500, width: 500 }}
                onBarCodeScanned={scanguia ? handleGuia : handleBarcodeScanned}
                type={type}
                >
                  <BarcodeMask edgeColor={'#62B1F6'} showAnimatedLine={false}/>
                </BarCodeScanner> 
              </View>
              <Snackbar visible = {snackbarMessage !== ''} onDismiss = {() => setMessage('')}>
                {snackbarMessage}
              </Snackbar>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'black', padding: 12 }}>

              <View style={{ width: 30, height: 30 }} />
              <Button mode = 'contained' onPress = {() => {setCameraVisible(false); setScanned(true); setMessage(''); setScanGuia(false)}}>Cerrar Camara</Button>
              <View style={{ width: 30, height: 30, backgroundColor: 'black', borderRadius: 15 }} />
            </View>
          </View>
      )
  }

    const escanearGuia = () => {
      if(destino ==''){

        const mensaje = {titulo: 'Atencion', cuerpo: 'Debe seleccionar un chofer destino primero'};
        setModalMsj(mensaje);
        setOpenModal(true);
      }else{
        setScanned(false);
        setScanGuia(true);
  
      }
   
    }

    return (
      <NativeBaseProvider>
      <View style = {{flex: 1}}>
        {scanned ? (
          <View style = {{flex:1}}>
          <Incio />
          <ScrollView>

          <View style = {{justifyContent:'center', padding:5}}>
             <Select 
              selectedValue={destino}
              minWidth = '200'
              variant='rounded'
              accessibilityLabel='Seleccione un chofer destino'
              placeholder='Seleccione un chofer destino'
              _selectedItem={{
                bg: 'blueGray.200',
                endIcon: <CheckIcon size = '5' />
              }}
              mt ={1} onValueChange = {value => setDestino(value)}>
                {renderChoferes()}
              </Select>

          </View>

          <View style = {emain.dataListContainer}> 
              <Text style = {emain.dataListTitle}>Bultos Transbordados: </Text> 
              {renderDataList()}
              <View style = {{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10}}>
              
                <Button mode='elevated' buttonColor='#b0ffab' textColor='black' icon='cube-scan' compact={true} 
                  onPress = {() => {
                    if(destino == ''){  
                      const mensaje = {titulo: 'Atencion', cuerpo: 'Debe seleccionar un chofer destino primero'};
                      setModalMsj(mensaje);
                      setOpenModal(true);
                    }else{
                      setScanned(false)
                    }
                    
                   }}>Escanear</Button>

                   <Button mode='elevated' buttonColor='#a3b6ff' textColor='black' icon='cube-send' compact={true} onPress={sendDataList}>Enviar</Button>
                   <Button mode='elevated' buttonColor='#ff9696' textColor='black' icon='update' compact={true}
                    onPress ={() => Alert.alert(
                      'Confirmacion',
                      'Eliminar bultos escaneados?',
                      [
                        {
                          text: 'Cancelar',
                          onPress:  () => console.log('Cancelado'),
                          style: 'cancel'
                        },
                        {
                          text: 'Eliminar',
                          onPress: Eliminar
                        }
                      ]
                    )}>Eliminar</Button>

              </View>

              <Button mode='elevated' textColor='black' icon='barcode-scan' onPress={() => escanearGuia()}>Escanear Guia</Button>
          </View>
          </ScrollView>
            <Portal>
              <Dialog visible={modalOpen} onDismiss={() => setOpenModal(false)}>
                <Dialog.Title>{modalMsj ? modalMsj.titulo : ''}</Dialog.Title>
                <Dialog.Content>
                  <Text variant="bodyLarge">{modalMsj ? modalMsj.cuerpo : ''}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setOpenModal(false)}>Cerrar</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            <ReactNativeLoadingSpinnerOverlay visible={loading} />
          </View>
      
        ): (

            renderCamera()
           
        )}
      </View>
      </NativeBaseProvider>
    )
}
