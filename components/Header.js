import { Text, View, Image, TouchableOpacity } from 'react-native';
import {Menu, Provider as PaperProvider, Divider} from 'react-native-paper';
import { useState } from 'react';
import Icon from 'react-native-vector-icons/Feather';

export const Header = ({ navigation, titulo }) => {
    const [visible, setVisible] = useState(false);
  
    const openMenu  = () => setVisible(true);
    const closeMenu = () => setVisible(false);
  
    return (
      <View style = {{ flexDirection: 'row', alignItems:'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 0, marginBottom: 6}}>
  
        <Image source={require('../assets/iconotra.png')} style={{ width: 40, height: 40 }} />
        <Text style = {{fontSize:18, fontWeight: '500'}}>{titulo}</Text>
  
        <Menu
          visible = {visible}
          onDismiss = {closeMenu}
          anchor = {
            <TouchableOpacity onPress = {openMenu}>
              <Icon name = 'menu' size={26} color = "#000" />
            </TouchableOpacity>
          }
        >
          <Menu.Item 
           title = 'Configuracion' 
           onPress={() => {
              console.log('configuracion');
              setVisible(false);
           }}        
          />
  
        </Menu>
  
  
      </View>
    )
  
}