  //import liraries
  import React, { Component } from 'react';
  import { View, Image, TouchableOpacity, Text, Keyboard, Alert, BackHandler } from 'react-native';
  import { createIconSetFromFontello } from "react-native-vector-icons";
  import Autocomplete from 'react-native-autocomplete-input';
  import { withNavigation } from "react-navigation";
  
  import NavBar from '../Components/NavBar';
  import config from "../Theme/Fonts/config"
  import styles from "../Components/Styles/HomeScreenStyles";

import * as RNLocalize from "react-native-localize";
import i18n from "i18n-js";
import memoize from "lodash.memoize"; 

import {
    I18nManager,
    SafeAreaView,
    ScrollView,
    StyleSheet,
  } from "react-native";

  const translationGetters = {
    en: () => require("../config/locales/en.json"),
    es: () => require("../config/locales/es.json")
  };


  const translate = memoize(
    (key, config) => i18n.t(key, config),
    (key, config) => (config ? key + JSON.stringify(config) : key)
  );

  

  const setI18nConfig = () => {
    // fallback if no available language fits
    const fallback = { languageTag: "en", isRTL: false };
  
    const { languageTag, isRTL } =
      RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
      fallback;
  
    // clear translation cache
    translate.cache.clear();
    // update layout direction
    I18nManager.forceRTL(isRTL);
    // set i18n-js config
    i18n.translations = { [languageTag]: translationGetters[languageTag]() };
    i18n.locale = languageTag;
  }; 



  /*
export default class HomeScresen extends Component {

    constructor(props) {
        super(props);
        setI18nConfig(); // set initial config
      }
    
      componentDidMount() {
        RNLocalize.addEventListener("change", this.handleLocalizationChange);
      }
    
      componentWillUnmount() {
        RNLocalize.removeEventListener("change", this.handleLocalizationChange);
      }
    
      handleLocalizationChange = () => {
        setI18nConfig();
        this.forceUpdate();
      };
      
  render() {
    return (
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.value}>{translate("hello")}</Text>
        </SafeAreaView>
      );
  }
}

const styles = StyleSheet.create({
    safeArea: {
      backgroundColor: "white",
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    },
    value: {
      fontSize: 18
    }
  });
*/





const CustomIcon = createIconSetFromFontello(config);

const API = 'http://api.enciclovida.mx';
const resultCategories=[
    'especie', 'subespecie', 
    'variedad', 'subvariedad', 
    'forma', 'subforma', 
    'reino', 'subreino',
    'division', 'subdivision',
    'superphylum', 'phylum', 'subphylum',
    'superclase', 'clase','subclase', 'infraclase',
    'grado',
    'superorden', 'orden', 'suborden', 'infraorden',
    'superfamilia', 'familia',  'subfamilia',
    'supertribu', 'tribu', 'subtribu',
    'genero', 'subgenero', 
    'seccion', 'subseccion',
    'serie', 'subserie',
];
var arraydata = [];

// create a component
class HomeScreen extends Component {
    constructor(props) {
        super(props);
        global.id_specie = 0;
        global.title = "";
        global.subtitle = "";
        global.filtro = "";
        global.listSpecies = "";
        global.LastlistSpecies = "";
        global.classificationList = [];
        global.ListReino = [];
        global.ListAnimales = [];
        global.ListPlantas = [];
        
        this.state = {
            data: [],
            query: '',
            show: true,
        };
        this._keyboardDidShow = () => {
            this.setState({
                show: false
            });
        }
    
        this._keyboardDidHide = () => {
            this.setState({
                show: true
            });
        }
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide
        );
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    fetchData = async (text) => {
        this.setState({ query: text })
        if(text != null && text.length > 1){
            fetch(`${API}/autocompleta/especies/${encodeURIComponent(text)}`)
            .then(res => res.json())
            .then((json) => {
                arraydata = [];
                if(json.error){
                }
                else{
                    resultCategories.forEach(category=>{
                        Array.prototype.push.apply(
                            arraydata, 
                            json.results[category].filter(item=> item.data.publico)
                        )
                    });
                }
                this.setState({ data: arraydata.slice() });
            }).catch((error) => {

            });
        }
        else
        {
            this.setState({ data : [] });
        }
    }

    handlePress(item) {
        
        this.setState({ query: "" })
        this.setState({ data : [] });
        //TODO Validar 
        global.id_specie = item.id;
        global.title = item.nombre_comun;
        global.subtitle = item.nombre_cientifico;
        global.classificationList = [];
        this.props.navigation.navigate("About", {});
        
    }

    footer = () => {
        if(this.state.show){
            return(
                <Image style={styles.footerImage}
                    source={{uri: 'ic_footer_home'}}/>
            )
        }
        else { 
            return(
                <View></View>
            )
        }
    };

    render() {
        const { query } = this.state;
        const { data } = this.state;
        return (
            /* Barra de navegación */
            <View style={[styles.mainScreen]}>
                <NavBar white={true} title = ""  menuLightButton={true}/> 
                <View style={styles.container}>
                    <View style={styles.view}>
                        <CustomIcon name="find" size={25} color="#304E5B" style={styles.favicon} />
                        <Autocomplete
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={styles.autocomplete}
                            inputContainerStyle={styles.inputContainerStyle}
                            containerStyle={styles.autocompleteContainer}
                            data={data}
                            defaultValue={query}
                            onChangeText={text => this.fetchData(text)}
                            placeholder="Ingresa la especie"
                            keyExtractor={(item, index) => item.id.toString() }
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => {
                                        this.handlePress(item.data);
                                        this.setState({ query: "" })
                                    }}>
                                    <View style={styles.contentItem}>
                                        <Image source={{ uri: item.data.foto ? item.data.foto : 'ic_imagen_not_found' }} style={styles.itemimage} />
                                        <View style={styles.text_view}>
                                            <Text style={styles.itemText}>{item.data.nombre_comun}</Text>
                                            <Text style={styles.itemTextSecond}>({item.data.nombre_cientifico})</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                            />
                    </View>
                    <View style={[styles.view, styles.viewImage]}>
                        <Image style={styles.image}
                            source={{uri: 'ic_top_home'}}/>
                    </View>
                    {this.footer()}
                </View>
            </View>
        );
    }
}

//make this component available to the app
export default withNavigation(HomeScreen);
