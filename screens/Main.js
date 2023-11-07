import { StyleSheet, View, Image, ImageBackground, TouchableOpacity, Alert, Dimensions, Vibration, Linking } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Camera, CameraType } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';
import { emain } from '../estilos';
import { ScrollView } from 'react-native-gesture-handler';
import ReactNativeLoadingSpinnerOverlay from 'react-native-loading-spinner-overlay';
import * as Location from 'expo-location';
import BarcodeMask from 'react-native-barcode-mask';
import { Modal, Snackbar, Button, Portal, Dialog, Text, IconButton, MD3Colors} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';



const url = 'http://192.168.230.98/proteoerp/app/usuario';


export const Main = () => {
    //Para la validacion del usuario
    const [cedula,  setCedula] = useState('');
    const [nombre,  setNombre] = useState('');
    const [codigo,  setCodigo] = useState('');
    const [host,    setHost]   = useState('');
    const [location, setLocation] = useState(null);
    const [snackbarMessage, setMessage] = useState('');
    const [selectedBulto,   setBulto]   = useState(null);
    const [motivo,          setMotivo]  = useState('');
    const [motivoVisible,   setMotivoVisible] = useState(false);
    const [motivoOption,    setMotivoOption]  = useState([]);
    const [modalVisible,    setVisible] = useState(false);
    const [infocliente,     setInfoCli] = useState([]);
    const [showFacturas,    setShowFacturas] = useState({});
    const [visibleRepartos, setVisibleRepartos] = useState({});
    const [scanguia,        setScanGuia] = useState(false);
    const [selectedImages,  setSelectedImages] = useState({});

    //Permisos de la camara
    const [type, setType] = useState(CameraType.back);
    const [hasPermission, setHasPermission] = useState(null);

    const [cameraVisible, setCameraVisible] = useState(false);
    
    //Para la lista de los escaneados
    const [scanned, setScanned] = useState(false);
    const [dataList, setDataList] = useState([]);

    //Pantalla de carga
    const [loading, isLoading]= useState(false);
    const vibracion = [500, 100];

    //Para la informacion en el modal 
    const [modalOpen,setOpenModal] = useState(false);
    const [modalMsj, setModalMsj] = useState([]);


    useEffect(() => {
      console.log(selectedImages);
      
    },[selectedImages])


    //************************************************************************
    //Funcion que se ejecuta cuando se escanea un codigo de barras de un bulto
    //************************************************************************
    const handleBarcodeScanned = ({ bounds, data }) => {

        if(dataList !== null){
          const index = dataList.findIndex((item) => item.code === data);
          if(index !== -1){
            //setScanned(true);

            if(dataList[index].observa > 0){
              setMessage('No se puede escanear un bulto con observacion');
              return; 
            }

            if(dataList[index].verificado){
              setMessage('Ya escaneado');

            }else{
              const updatedItem = {
                ...dataList[index],
                date: new Date().toLocaleString('es-ES'),
                user: codigo,
                location: 
                  location && location.coords
                  ? location.coords.latitude + ' ' + location.coords.longitude
                  : '0 0', // Asigna '0 0' si location es null
                verificado: true,
              };  

              const newDataList = [...dataList];
              newDataList[index] = updatedItem;
              setDataList(newDataList);
              setMessage('Escaneado Correctamente');
              Vibration.vibrate(vibracion);
            }

          }else{
            setMessage('Codigo de barras invalido');

          }
        }else{
          setDataList([]);
        }          
    };

    //*************************************
    //Devuelve informacion sobre el cliente 
    //*************************************
    const infocli = async (cliente) => {
      isLoading(true);
      try{
        await axios.post(host+'cliente', {cliente: cliente})
        .then(res => {
          if(res.data.success){
            setInfoCli(res.data.info);
            console.log(cliente);
            isLoading(false);
            setVisible(true);
          }else{
            isLoading(false);

            const mensaje = {titulo: 'Error', cuerpo: 'No se ha podido recuperar la informacion del cliente'};
            setModalMsj(mensaje);
            setOpenModal(true);
          }
        });
        
      }catch(error){
        isLoading(false);

        const mensaje = {titulo: 'Error', cuerpo: error};
        setModalMsj(mensaje);
        setOpenModal(true);
      }

    }


    //*****************************************
    //Para reportar entrega fallida de un bulto
    //*****************************************
    const entregaFallida = (data) => {
      setBulto(data);
      isLoading(true);

      if(data.verificado){
        isLoading(false);
        const mensaje = {titulo: 'Error', cuerpo: 'No se puede reportar fallido un bulto ya escaneado'};
        setModalMsj(mensaje);
        setOpenModal(true);
        return;
      }

      fetch(host+'motivos')
      .then((response) => response.json())
      .then((json) =>{
          setMotivoOption(json);
          isLoading(false);
          setMotivoVisible(true);
          console.log(data);
      })
      .catch((error) => {
          console.log(error);
          isLoading(false);
      })
    }

    //**************************************
    //Lista de motivos de la entrega fallida
    //**************************************
    const motivos = () => {
      return motivoOption.map(item => (
          <Picker.Item key ={item.id} label = {item.nom} value = {item.id}/>
        ));    
    }

    //********************************
    // Para borrar una guia especifica
    //********************************
    const BorrarGuia = (guia) => {

      const newSelectedImages = Object.keys(selectedImages).reduce((result, reparto) => {
        if(reparto != guia) {
          result[reparto] = selectedImages[reparto];
        }
        return result;
      }, {})

      AsyncStorage.setItem('Images', JSON.stringify(newSelectedImages));

      setSelectedImages(newSelectedImages);

      //Filtrar y actualizar la lista de repartos
      const newDataList = dataList.filter((item) => item.reparto !== guia);
      setDataList(newDataList);
      console.log(guia);
    }
    
    //****************************************
    //Muestra la lista de repartos descargados 
    //****************************************
    const renderDataList = () => {

      if(!dataList){
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


      const sortedData = dataList.sort((a,b) => a.reparto.localeCompare(b.reparto));



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
            <View style = {{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
              <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 3, marginBottom: 5}}>Guia {reparto}</Text>
              
              {selectedImages[reparto] && ( 
                  <Text style={{ fontSize: 14, fontWeight: 'bold', marginRight: 15, color:'purple' }}>
                    {selectedImages[reparto].length}
                  </Text>
              )}
            </View>

          </TouchableOpacity>
          
          {visibleRepartos[reparto] &&
            Object.keys(groupedData[reparto]).map((cliente) => (
            <View key={cliente}>
            <View style = {{marginVertical: 2, paddingVertical: 3, borderRadius: 1, paddingHorizontal: 5, flexDirection:'row', justifyContent:'space-between'}}>
              <TouchableOpacity onPress = {() => toggleShowFacturas(cliente )}>
                <Text style = {{fontSize: 13, fontWeight: '700', marginTop: 5}}>{cliente}</Text>
              </TouchableOpacity>              
              <TouchableOpacity onPress = {() => infocli(cliente)} style = {{paddingHorizontal: 10, borderRadius: 15, alignContent:'center'}}>
                 <Icon name="info-circle" size={20} />
              </TouchableOpacity>
            </View>
            {showFacturas[cliente] &&
              groupedData[reparto][cliente].data.map((data) => (
                <View key={data.id}>
                  <View style={emain.dataListItem}>
                    <TouchableOpacity onPress = {() => entregaFallida(data)}>
                      <Text style={emain.dataListItemText}>{data.pedido}</Text>
                    </TouchableOpacity>
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
            <View>
              <View key = {reparto} style = {{flexDirection:'row', justifyContent:'space-between'}}>
                <TouchableOpacity style = {{marginTop:10, marginBottom:5, marginHorizontal: 8}} onPress={() => {
                  //const id = reparto.substring(0,5);
                  openImagePicker(reparto);
                }}>
                  <Text style = {{fontWeight:'500', textDecorationLine:'underline', fontSize:14}}>Cerrar Guia</Text>
                </TouchableOpacity>

                <TouchableOpacity style = {{marginTop:10, marginBottom:5, marginHorizontal: 8}} onPress={() => {sendGuia(reparto);}}>
                  <Text style = {{fontWeight:'500', textDecorationLine:'underline', color: 'blue', fontSize:14}}>Enviar Guia</Text>
                </TouchableOpacity>


                <TouchableOpacity style = {{marginTop:10, marginBottom:5, marginHorizontal: 8}} onPress = {() => Alert.alert(
                  'Confirmacion',
                  'Desea borrar '+reparto+'?',
                  [
                    {
                      text: 'Cancelar',
                      onPress:  () => console.log('Cancelado'),
                      style: 'cancel'
                    },
                    {
                      text: 'Eliminar',
                      onPress: () => BorrarGuia(reparto)
                    }
                  ]
                  )}>
                  <Text style = {{fontWeight:'500', textDecorationLine:'underline', fontSize:14, color:'red'}}>Eliminar Guia</Text>
                </TouchableOpacity>
              </View>
             
             </View>
          )}

          </View>
      ));
    };


    //*************************************************************************
    //Actualiza los repartos de la lista (Los elimina y los vuelve a descargar)
    //*************************************************************************
    const Eliminar = () => {
        setDataList([]);
        setSelectedImages({});

        descargarRepartos();              
    }

    //**********************************************
    //Eviar las imagenes pertenecientes en las guias
    //**********************************************
    const enviaImagenes = async () => {
      isLoading(true);

      const groupedData = dataList.reduce((result, data) => {
        if (!result[data.reparto]) {
          result[data.reparto] = [];
        }
        result[data.reparto].push(data);
        return result;
      }, {});

      if (Object.keys(selectedImages).length === 0) {
        const mensaje = { titulo: 'Atención', cuerpo: 'No hay imágenes para enviar' };
        setModalMsj(mensaje);
        setOpenModal(true);
        isLoading(false);
        return false;
      }
      

      console.log(selectedImages);

      try{
        const formData = new FormData();

        for(const reparto in selectedImages){
          selectedImages[reparto].forEach((imageUri, index) => {
            const imageName = `${reparto.substring(0, 5)}_${index}.jpg`;
            const image = {
              uri: imageUri,
              type: 'image/jpeg',
              name: imageName,
            };
            formData.append(imageName, image);
          })
        }
        console.log(formData);

        const response = await axios.post(host + 'imagenes', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Importante para enviar archivos
          },
        });

        if (response.data.success) {
          for (const reparto in groupedData) {
            setSelectedImages((prevSelectedImages) => {
              const updatedSelectedImages = { ...prevSelectedImages };
              delete updatedSelectedImages[reparto]; // Elimina la entrada del reparto
              AsyncStorage.setItem('Images', JSON.stringify(updatedSelectedImages));
              return updatedSelectedImages;
            });
          }

          isLoading(false);
    
          // AsyncStorage.setItem('scannedDataList', JSON.stringify(facturasNoEnviadas));
          const mensaje = {titulo: 'Exito', cuerpo: response.data.mensaje};
          setModalMsj(mensaje);
          setOpenModal(true);

        } else {
          console.log(response.data);
          isLoading(false);

          const mensaje = {titulo: 'Error', cuerpo: response.data.mensaje};
          setModalMsj(mensaje);
          setOpenModal(true);
        }

      }catch (error){
        console.log(error);

        if (axios.isCancel(error)) {
          const mensaje = {titulo: 'Error', cuerpo: 'El envío de imagenes fue cancelado. Por favor, revise su conexión a internet. '+error};
          setModalMsj(mensaje);
          setOpenModal(true);
        } else {
          const mensaje = {titulo: 'Error', cuerpo: 'Ocurrió un error al enviar los imagenes. Por favor, revise su conexión a internet.'+error};
          setModalMsj(mensaje);
          setOpenModal(true);
          
        }
        isLoading(false);
      }


    }
    
    //*************************************************************************
    //Funcion que envia los bultos escaneados o con entrega fallida al servidor
    //*************************************************************************
    const sendDataList = async () => {
      isLoading(true);
       
      const groupedData = dataList.reduce((result, data) => {
        if (!result[data.reparto]) {
          result[data.reparto] = [];
        }
        result[data.reparto].push(data);
        return result;
      }, {});
    
      let continuar = true;

      const facturasTotales = dataList.filter((item) => item.verificado === true);

      if (facturasTotales.length === 0) {
        const mensaje = {titulo: 'Atencion', cuerpo: 'No hay facturas para enviar'};
        setModalMsj(mensaje);
        setOpenModal(true);
        isLoading(false);
        return;
      }
    
      for (const reparto in groupedData) {
        const facturasVerificadas = groupedData[reparto].filter((factura) => factura.verificado === true);

        // Compara la cantidad de registros verificados con la cantidad total de registros 
        if (facturasVerificadas.length === groupedData[reparto].length && selectedImages[reparto]) {
          continuar = false;
          const mensaje = {titulo: 'Atencion', cuerpo: `Debe enviar primero las imagenes del reparto ${reparto}`};
          setModalMsj(mensaje);
          setOpenModal(true);
          break;
        }  
      }
    
      if (!continuar) {
        isLoading(false);
        return;
      }
    
      try {

        const response = await axios.post(host + 'bultos', facturasTotales);
    
        if (response.data.success) {

          const facturasNoEnviadas = dataList.filter((factura) => factura.verificado === false);
          setDataList(facturasNoEnviadas);
          isLoading(false);
    
          const mensaje = {titulo: 'Exito', cuerpo: response.data.mensaje};
          setModalMsj(mensaje);
          setOpenModal(true);

        } else {

          console.log(response.data);
          isLoading(false);

          const mensaje = {titulo: 'Error', cuerpo: response.data.mensaje};
          setModalMsj(mensaje);
          setOpenModal(true);
        }
      } catch (error) {
        console.log(error);
        if (axios.isCancel(error)) {
          const mensaje = {titulo: 'Error', cuerpo: 'El envío de datos fue cancelado. Por favor, revise su conexión a internet. '+error};
          setModalMsj(mensaje);
          setOpenModal(true);
        } else {
          const mensaje = {titulo: 'Error', cuerpo: 'Ocurrió un error al enviar los datos. Por favor, revise su conexión a internet.'+error};
          setModalMsj(mensaje);
          setOpenModal(true);
          
        }
        isLoading(false);
      }
    };

    //*************************************************************************
    //Funcion que envia los bultos escaneados o con entrega fallida al servidor
    //*************************************************************************
    const sendGuia = async (guia) => {
      isLoading(true);
    
      //let facturasParaEnviar = [];

      const verificadas = dataList.filter((item) => item.verificado === true && item.reparto == guia);
            
      if(verificadas.length === 0){

        const mensaje = {titulo: 'Atencion', cuerpo: 'No hay facturas para enviar '+guia};
        setModalMsj(mensaje);
        setOpenModal(true);
        isLoading(false);

        return;
      }

      if (selectedImages[guia]) {
        const mensaje = {titulo: 'Atencion', cuerpo: `Debe enviar primero las imagenes de la guia: ${guia}`};
        setModalMsj(mensaje);
        setOpenModal(true);
        return;
      }

    
      //facturasParaEnviar = facturasParaEnviar.concat(verificadas);
    
      try {
        //const formData = new FormData();

        //formData.append('facturas', JSON.stringify(facturasParaEnviar));

        const response = await axios.post(host + 'bultos', verificadas);
    
        if (response.data.success) {

          //const facturasNoEnviadas = dataList.filter((factura) => factura.verificado === false);

          const facturasNoEnviadas = dataList.filter((factura) => !verificadas.includes(factura));


          setDataList(facturasNoEnviadas);
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
          const mensaje = {titulo: 'Error', cuerpo: 'El envío de datos fue cancelado. Por favor, revise su conexión a internet. '+error};
          setModalMsj(mensaje);
          setOpenModal(true);
        } else {
          const mensaje = {titulo: 'Error', cuerpo: 'Ocurrió un error al enviar los datos. Por favor, revise su conexión a internet.'+error};
          setModalMsj(mensaje);
          setOpenModal(true);
        }
        isLoading(false);
      }
    };    

    //*************************************************************************
    // Pide los permisos de la camara cuando abre la aplicacion por primera vez
    //*************************************************************************
    useEffect(() => {
        setScanned(true);             
        
        const getBarCodeScannerPermissions = async () => {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        };
    
        getBarCodeScannerPermissions();

        //Recuperar la data guardada
        AsyncStorage.getItem('scannedDataList').then((res) => setDataList(JSON.parse(res)))
        
        
    }, []);


    //***************************************************************************************************
    // Si existe informacion guardada de la lista de bultos la coloca en la variable, si no la pone vacia
    //***************************************************************************************************
    useEffect(() => {
      if (dataList !== null) {
        AsyncStorage.setItem('scannedDataList', JSON.stringify(dataList));
      }else{
        setDataList([]);
      }
    }, [dataList]);
    

    //***************************************
    // Pide los permisos para la localizacion
    //***************************************
    useEffect(() => {
      (async () => {
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Error','No se han dado permisos para la localizacion');
          return;
        }
        
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      })();
    }, []);

    //*************************************
    //Banner de la parte superior de la app
    //*************************************
    const Inicio = () => {
      return (
          <View style = {{backgroundColor: '#003466', alignItems: 'center', padding: 5}}>
            <Text style = {{fontSize: 16, fontWeight: '500', color: '#FFF'}}>Escaneo y Entrega de bultos</Text>
            <Image source={require('../assets/Proteoblanco.png')} style = {{height: 80, width: 350}} />
            <Text style = {{fontSize: 16, fontWeight: '500', color: '#FFF'}}>Usuario: {nombre}</Text>
          </View>
      )
    }

    //*******************************
    //Funcion que renderiza la camara
    //*******************************
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
                <Button mode = 'contained' onPress = {() => {setCameraVisible(false); setScanned(true); setMessage(''); setScanGuia(false)}}>
                    Cerrar Camara
                </Button>
                <View style={{ width: 30, height: 30, backgroundColor: 'black', borderRadius: 15 }} />
              </View>
            </View>
        )
    }

    //**********************************************************
    //Para escanear el codigo de barras de la guia y descargarla
    //**********************************************************
    const handleGuia = async ({bounds, data}) => {
      console.log(data);
      setScanned(true);
      setScanGuia(false);

      isLoading(true);

      try {
        const guiaId = data.substring(3);        

        const guiaExistente = dataList.find((reparto) =>  reparto.reporg === guiaId);
        if(guiaExistente){
          isLoading(false);
          //alert('La guia ya ha sido descargada');
          
          const mensaje = {titulo: 'Error', cuerpo: 'La guia ya ha sido descargada '+error};
          setModalMsj(mensaje);
          setOpenModal(true);
          return; 
        }
        // Realizar la solicitud HTTP para descargar los repartos nuevamente
        const response = await axios.post(host + 'guias/' + data+'/E');
        const guia = response.data;
    
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
          tipo: 'EN',
          verificado: false,
          reparto: reparto.reparto,
          observa: '0',
          reporg: reparto.reporg
        }));
        
    
        // Actualizar la lista de repartos con los nuevos repartos descargados
        setDataList((prevDataList) => prevDataList.concat(nuevaGuia));
    
        isLoading(false);
        //alert('Guia descargada exitosamente');

        const mensaje = {titulo: 'Exito', cuerpo: 'Guia descargada exitosamente'};
        setModalMsj(mensaje);
        setOpenModal(true);

      } catch (error) {
        console.log(error);
        isLoading(false);

        //alert('Error al descargar la guia');
        const mensaje = {titulo: 'Error', cuerpo: 'Error al descargar la guia'};
        setModalMsj(mensaje);
        setOpenModal(true);
      }
    }

    useEffect(() => {
      AsyncStorage.getItem('cedula').then((res) => {
        setCedula(res);
      });
    
      AsyncStorage.getItem('nombre').then((res) => {
        setNombre(res);
      });

      AsyncStorage.getItem('codigo').then((res) => {
        setCodigo(res);
      });

      AsyncStorage.getItem('host').then((res) => {
        setHost(res);
      });

      AsyncStorage.getItem('Images').then((res) => {
        if(res){
          //console.log(res);
          setSelectedImages(JSON.parse(res));
        }
      })


    }, [cedula, nombre, codigo, host]);


    //**************************************************************
    // Funcion que actualiza la lista y marca el bulto con el motivo
    //**************************************************************
    const handleMotivo = (bulto) => {
      const index = dataList.findIndex((item) => item.code === bulto);

      const updatedItem = {
        ...dataList[index],
        observa: motivo,
        user: codigo,
        verificado: true

      };

      const newDataList = [...dataList];
      newDataList[index] = updatedItem;
      setDataList(newDataList);
      setMotivoVisible(false);

    }

    //******************************************************************************
    //Funcion que abre la galeria para seleccionar las imagenes de la guia entregada
    //******************************************************************************

    const openImagePicker = async (reparto) => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
      if (status !== 'granted') {
        alert('Permiso para acceder a la galería denegado.');
        return;
      }
    
      try {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          aspect: [4, 3],
          quality: 0.3,
          allowsMultipleSelection: true,
          selectionLimit: 6
        });

        const {assets} = result;


        if (!result.canceled) {

          const selectedUris = assets.map(asset => asset.uri);

          setSelectedImages((prevSelectedImages) => ({
            ...prevSelectedImages,
            [reparto]: selectedUris,
          }));

          //Para actualizar el AsyncStorage
          const updatedSelectedImages = {
            ...selectedImages,
            [reparto]: selectedUris,
          };
          
          await AsyncStorage.setItem('Images', JSON.stringify(updatedSelectedImages));
          //console.log('Imagenes seleccionadas:', result.selected);
        }

        //console.log(selectedImages);
      } catch (error) {
        console.log('Error al acceder a la galería:', error);
      }
    };
    
    

    //**************************************************************
    // Funcion que descarga los repartos pertenecientes a ese chofer
    //**************************************************************
    const descargarRepartos = async () => {
      isLoading(true);
    
      try {
        // Realizar la solicitud HTTP para descargar los repartos nuevamente
        const response = await axios.post(host + 'repartos/' + codigo);
        const repartos = response.data;
     
        // Mapear los repartos descargados al formato esperado
        const nuevosRepartos = repartos.map((reparto) => ({
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
          tipo: 'EN',
          verificado: false,
          reparto: reparto.reparto,
          observa: '0',
        }));

        // Actualizar la lista de repartos con los nuevos repartos descargados
        setDataList(nuevosRepartos);
    
        isLoading(false);
        //alert('Repartos descargados exitosamente');

        const mensaje = {titulo: 'Exito', cuerpo: 'Repartos descargados exitosamente'};
        setModalMsj(mensaje);
        setOpenModal(true);
      } catch (error) {
        console.log(error);
        isLoading(false);
        //alert('Error al descargar los repartos');
        const mensaje = {titulo: 'Error', cuerpo: 'Error al descargar repartos '+error};
        setModalMsj(mensaje);
        setOpenModal(true);
      }
    };

    const escanearGuia = () => {
      setScanned(false);
      setScanGuia(true);
   
    }
    

    return (
      <View style = {{flex: 1}}>
        {scanned ? (
          <View style = {{flex:1}}>
          <Inicio />
          <ScrollView>
          <View style = {emain.dataListContainer}> 
              <Text style = {emain.dataListTitle}>Lista de Guias: </Text> 
              {renderDataList()}
              <View style = {{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10}}>

                <Button icon='cube-scan' buttonColor='#b0ffab' mode = 'elevated'textColor='black' compact ={true} onPress={() => setScanned(false)}>Escanear</Button>
                <Button icon='cube-send' buttonColor='#a3b6ff' mode = 'elevated'textColor='black' compact ={true} onPress={sendDataList}>Enviar</Button>
                <Button icon= 'update' buttonColor='#ff9696' mode='elevated'textColor='black' compact= {true} onPress ={() => Alert.alert(
                  'Confirmacion',
                  'Desea actualizar los repartos?',
                  [
                    {
                      text: 'Cancelar',
                      onPress:  () => console.log('Cancelado'),
                      style: 'cancel'
                    },
                    {
                      text: 'Actualizar',
                      onPress: Eliminar
                    }
                  ]
                  )}>
                    Actualizar
                  </Button>

              </View>
              <Button icon='image-outline' mode='elevated' buttonColor='#b6adff' textColor='black' compact ={true} onPress={() => enviaImagenes()}>Enviar Imagenes</Button> 

              <View style = {{flexDirection:'row', justifyContent:'space-between', marginTop:10 }}>

                <Button icon='download-outline' buttonColor='#ffffa3' mode='elevated'textColor='black' compact ={true} onPress={() => descargarRepartos()}>
                  Descargar Guias
                </Button>

                <Button icon='barcode-scan' mode='elevated'textColor='black' compact ={true} onPress={() => escanearGuia()}>
                  Escanear Guias
                </Button>

              </View>
              

          </View>
          </ScrollView>
            {modalVisible &&
              infocliente.map((data) =>  (
              <Modal visible={modalVisible} animationType="slide" onDismiss={() => setVisible(false)} key = {data.id}>
                <View style = {emain.modalView}>
                  <View style = {{alignItems: 'center'}}>
                    <Text style = {{fontSize: 18, fontWeight:'500', marginBottom: 20}}>Detalles del Cliente</Text>
                  </View>
                  <Text style = {{ padding: 4, fontWeight:'300'}}>Codigo: {data.codigo}</Text>
                  <Text style = {{ padding: 4, fontWeight:'300'}}>Direccion: {data.direccion}</Text>

                  <Text 
                    style = {{ marginBottom:25,padding: 4,fontWeight:'300', color: 'blue'}} 
                    onPress = {() => {
                      const numero = data.telefono;
                      Linking.openURL(`tel:${numero}`);
                    }}
                    >Telefono: {data.telefono}</Text>

                  <Button  mode="contained" onPress={() => setVisible(false)}>Cerrar</Button>
                </View>
              </Modal>          
            ))}

            {motivoVisible &&  (
              <Modal visible={motivoVisible} animationType="slide" onDismiss={() => setMotivoVisible(false)}>
              <View style = {emain.modalView}>
                <View style = {{alignItems: 'center'}}>
                  <Text style = {{fontSize: 16, fontWeight:'500', marginBottom: 10}}>Motivo de entrega fallida bulto {selectedBulto.pedido}</Text>
                </View>

                <Picker
                  selectedValue={motivo}
                  onValueChange = {(value) => setMotivo(value)}
                  >
                    <Picker.Item label='Seleccione un Motivo' value='' />
                    {motivos()}
                </Picker>
                <View style = {{flexDirection:'row', justifyContent:'space-between', marginTop:15}}>
                  <Button  mode="contained"  onPress={() => handleMotivo(selectedBulto.code)}>Aceptar</Button>
                  <Button  mode="contained"  onPress={() => setMotivoVisible(false)}>Cerrar</Button>
                </View>

              </View>
            </Modal>
            )}
            <ReactNativeLoadingSpinnerOverlay visible={loading} />
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
          </View>
      
        ): (

            renderCamera()
           
        )}
        
      </View>
    )
}
