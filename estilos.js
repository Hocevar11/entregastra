import { Button, StyleSheet, Text, Touchable, TouchableOpacity, View, TextInput, Image, DrawerLayoutAndroid, ScrollView, ImageBackground} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        marginTop: 200,
        padding: 15,
        margin: 15,
        backgroundColor: '#000',
        borderRadius: 5,
    },
  
    logo: {
        width: 330,
        height: 90,
        marginTop: 10,
        marginBottom: 10,
    },
  
    fondo: {
        flex: 1,
        resizeMode: 'cover',
        width: '100%', 
        height: '100%',
        position:'absolute'
      },

      input: {
        height: 40,
        marginVertical: 10,
        paddingHorizontal: 10,
        color: '#FFF',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
        
      },
});

export const ehost = StyleSheet.create({
  text: {
      alignContent:'center', 
      fontSize: 12
  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
  },

  cardContainer: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 10,
      marginVertical: 5,
      marginHorizontal: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    cardText: {
      fontSize: 14,
    },

  container2: {
      marginTop: 5,
      padding: 15,
      margin: 15,
      backgroundColor: '#000',
      borderRadius: 5,
      justifyContent: 'space-between',

      
    },

  floatingButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#003466',
      borderRadius: 50,
      height: 50,
      width: 50,
      justifyContent: 'center',
      alignItems: 'center',
  },

  button: {
      backgroundColor: '#217a20',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 20,
    },

    button2: {
      backgroundColor: '#003466',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 20,
    },

    button3: {
      backgroundColor: '#c42525',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 20,
    },

    button4: {
      backgroundColor: '#41acb0',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 20,
    },

    buttonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
    },

})

export const echost = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    margin: 10,
    paddingHorizontal: 10,
  },

  button: {
      backgroundColor: '#217a20',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 20,
  },

  buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
  },
});

export const emain = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  container212: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },

  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: '#000'
  },
  
  cameraPreview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  dataListContainer: {
    marginTop: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '100%',
  },

  centeredView: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },

  modalView: {
    margin: 30,
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 35,
    paddingBottom: 35, 
    paddingTop: 23,
    
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  dataListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dataListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dataListItemText: {
    fontSize: 11,
  },
  dataListItemDate: {
    fontSize: 12,
    color: '#999',
  },
  button: {
    backgroundColor: '#217a20',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },

  button2: {
    backgroundColor: '#003466',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },

  button3: {
    backgroundColor: '#c42525',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },


  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  cameraButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
})

const opacity = 'rgba(0, 0, 0, .6)';
export const ecamera = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scanArea: {
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: 'transparent',
    width: '85%',
    height: '20%',
  },
  layerTop: {
    flex: 1,
    backgroundColor: opacity,
  },
  layerCenter: {
    flex: 2,
    flexDirection: 'row',
  },
  layerLeft: {
    flex: 1,
    backgroundColor: opacity,
  },
  focused: {
    flex: 10,
    borderColor: '#fff',
    borderWidth: 2,
  },
  layerRight: {
    flex: 1,
    backgroundColor: opacity,
  },
  layerBottom: {
    flex: 1,
    backgroundColor: opacity,
  },
});


