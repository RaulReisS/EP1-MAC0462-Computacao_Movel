import React, {useEffect, useState} from 'react'
import { StatusBar } from 'expo-status-bar'
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native'
import { globalStyles } from '../styles/global'
import { colors } from '../styles/colors'
import * as Location from 'expo-location'
import WeatherInfo from '../components/WeatherInfo'
import { AsyncStorage } from 'react-native';
import { WEATHER_API_KEY } from '@env' 


const WEATHER_API_KEY = "e3226d5a710ed7b606cbe4443abb8c31"

const BASE_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?"

const unitsSystem = "metric"

export default function ({ navigation, route }) {
    const [errorMessage, setErrorMessage] = useState(null)
    const [currentWeather, setCurrentWeather] = useState(null)
    const [test, setTest] = useState('Clima: ')
    const [hist, setHist] = useState([])

    useEffect(() => {
        loadWeather()
    },[])

    async function loadWeather() {
        setCurrentWeather(null)
        setErrorMessage(null)

        try {
            const recebido = await AsyncStorage.getItem('historia')
            if (recebido !== null) {
                const traduzido = JSON.parse(recebido)
                setHist(traduzido)
            }
            let { status } = await Location.requestPermissionsAsync()

            if (status != 'granted') {
                setErrorMessage('É necessário acessar o local do dispositivo para esta funcionalidade')
                alert(status)
                return
            }

            let location = await Location.getCurrentPositionAsync({accuracy: 1})

            const {latitude, longitude} = location.coords
            const wetaherUrl = `${BASE_WEATHER_URL}lat=${latitude}&lon=${longitude}&units=${unitsSystem}&lang=pt_br&appid=${WEATHER_API_KEY}`

            const response = await fetch(wetaherUrl);
            const result = await response.json()

            if (response.ok) {
                const {
                    main: {temp},
                    weather: [details],
                    name
                } = result
                const { description } = details
                const date = new Date()
                const dia = date.getDay()
                const mes = date.getMonth()
                const ano = date.getFullYear()
                const hora = date.getHours()
                const min = date.getUTCMinutes()

                setHist((prev) => {
                    const lista = prev;
                    const novoItem = {
                        tempo: `${temp} °C`,
                        nome: `${description}`,
                        local: `${name}`,
                        data: `${dia}/${mes}/${ano} ${hora}:${min}`,
                        key: `${lista.length}`
                    }
                    lista.push(novoItem)
                    alert(lista.length)
                    return lista
                })

                setCurrentWeather(result)

                await AsyncStorage.setItem('historia', JSON.stringify(hist))
            }
            else {
                setErrorMessage(error.message)
            }
        }
        catch (error) {
            setErrorMessage(error.message)
            alert(`Catch: ${error}`)
        }
    }

    if (currentWeather) {
        return (
            <View style={ globalStyles.container }>
                <StatusBar style="auto" />
                <WeatherInfo currentWeather={currentWeather}/>
                <TouchableOpacity onPress={loadWeather}>
                    <View style={globalStyles.historyBox}>
                        <Text style={globalStyles.secondaryText}>Histórico</Text>
                    </View>
                </TouchableOpacity>
                <FlatList 
                numColumns={1}
                data={hist}
                renderItem={({ item}) => (
                    <View>
                        <Text>{item.tempo}</Text>
                        <Text>{item.desc}</Text>
                        <Text>{item.local}</Text>
                        <Text>{item.data}</Text>
                        <Text>{item.key}</Text>
                    </View>
                )}
                />
            </View>
        )
    }
    else if (errorMessage) {
        return (
            <View style={styles.container}>
                <StatusBar style="auto" />
                <View>
                    <Text style={{textAlign: 'center'}}>{errorMessage}</Text>
                </View>
            </View>
        );
    }
    else {
        return (
            <View style={globalStyles.container}>
                <StatusBar style="auto" />
                <ActivityIndicator size="large" color={colors.PRIMARY_COLOR}/>
            </View>
        )
    }
}