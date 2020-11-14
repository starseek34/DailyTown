import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper'
import * as Google from 'expo-google-app-auth';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios'

import * as env from '../env';
import Board from '../components/MainPageBoard'
import MainPageInventory from '../components/mainbottom/MainPageInventory'
import MissionModal from '../components/mission_modal/MissionModal';
import MyGold from '../components/MyGold';
import InventoryItems from '../components/mainbottom/InventoryItems'


export default function Main({ navigation }) {
  const xyCount = 6
  const [goldStatus, setGoldStatus] = useState(10)
  const [myItems, setMyItems] = useState(
    InventoryItems
  )
  // Axios Header에 들어갈 jwt -> userToken
  const [userToken, setUserToken] = useState('')
  const [accessToken, setAccessToken] = useState('')
  async function getToken () {
      const jwt = await SecureStore.getItemAsync('token')
      setUserToken(jwt)
      console.log('userToken', jwt);
      const acst = await SecureStore.getItemAsync('access_token')
      setAccessToken(acst)
      console.log('accessToken',acst);
    }
  
  // const [accessToken]
      // "0": {
      // "name": "임시1",
      // "price": 500, 
      // "image": "test1"
      // }

  // "0": {
  // "name": "임시1",
  // "price": 500,
  // "image": "test1"
  // }

  // 맨처음 한번만 받아올 예정
  // 비로그인시 접속 가능(개발용, 배포시에 막아놓을 것)
  //   useEffect( () => {
  //   axios.get('http://k3b305.p.ssafy.io:8080/items/getInventory')
  //     .then(res => {
  //       setGoldStatus( res.data.gold )
  //       setMyItem( res.data )
  //     })
  //     .catch(err => {
  //       console.log(err)
  //     })
  //   })
  // }, [])
  const [isChangeItemPlace, setIsChangeItemPlace] = useState(false)
  const [itemInfo, setItemInfo] = useState(null)
  const [changedIndex, setChangedIndex] = useState(null)
  const [isMove, setIsMove] = useState(false)
  const [data, setData] = useState([])
  function changeDate(newData) {
    setData(newData)
    const newArray = [];
    for (let i = xyCount; i > 0; i--) {
      newArray.push(Array(xyCount).fill(null));
    }
    newData.forEach(element => {
      newArray[element.x][element.y] = element.name 
    });
    setTiles(newArray)
  }
  const newArray = [];
  for (let i = xyCount; i > 0; i--) {
    newArray.push(Array(xyCount).fill(null));
  }
  data.forEach(element => {
    newArray[element.x][element.y] = element.name
  });
  const [tiles, setTiles] = useState(newArray)
  useEffect(() => {
    // 비로그인시 접속 가능(개발용, 배포시에 막아놓을 것)
    getToken()
    // console.log(jwt)
    axios
    .get('http://k3b305.p.ssafy.io:8005/account/myitem/',
    {
      'headers': {
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6ImVoajAxMjhAZ21haWwuY29tIiwiZXhwIjoxNjA3ODYwOTk1LCJlbWFpbCI6ImVoajAxMjhAZ21haWwuY29tIn0.qPsfPPmMOrSV4FzIW8bAwOnYuKKXdPWpFiQ4SMcZXvw'
      }
    })
    .then(res => {
      const tempData = []
      res.data.forEach(element => {
        if (element.isinfarm) {
          let xys = element.location - 1
          let x = xys % 6
          let y = parseInt(xys / 6)
          tempData.push({
            id: element.id,
            x: x,
            y: y,
            name: element.item.name,
          })
        } else {
          myItems[element.location-1] = {
            id: element.id,
            name: element.item.name,
            location: element.location,
            price: element.item.sell_price,
          }          
        }
      })
      changeDate(tempData)
    })
    .catch(err => console.log(err))
  }, [])
  // getToken()
  return (
    <View style={styles.container}>
      {/* 로그인 페이지로 이동 버튼(임시) */}
      <TouchableOpacity
        style={styles.devbutton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>LoginPage(for Dev)</Text>
      </TouchableOpacity>
      {/* 토큰 저장소 확인버튼(임시) */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 100, backgroundColor: '#000000', zIndex: 100 }}
        onPress={async () => {
          const jwt = await SecureStore.getItemAsync('token')
          console.log(jwt, '이게 스토어의 토큰');
          const acst = await SecureStore.getItemAsync('access_token')
          console.log(acst, '이게 스토어의 액세스 토큰');
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>저장값꺼내기</Text>
      </TouchableOpacity>
      {/* 로그아웃 버튼 */}
      <IconButton
        style={styles.logoutButton}
        onPress={async () => {
          await Google.logOutAsync({ accessToken, androidClientId: env.AND_KEY, androidStandaloneAppClientId: env.AND_KEY});
          // ------------------------ access token 만료 확인용 -------------------------------
          // let userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          //   headers: { Authorization: `Bearer ${accessToken}` },
          // })
          // .then(
          //   res => res.json()
          // )
          // .then(
          //   json => {console.log(json)}
          // );
          await SecureStore.deleteItemAsync('token')
          await SecureStore.deleteItemAsync('access_token')
          navigation.navigate('Login')
        }}
        icon="logout"
        size={40}
      ></IconButton>
      <View style={styles.containerTop}>
        <View style={styles.infoContainer}>
          <MissionModal userToken={ userToken } />
        </View>
        <MyGold goldStatus={goldStatus} />
        <Board changedIndex={changedIndex} setChangedIndex={setChangedIndex} myItems={myItems} itemInfo={itemInfo} isMove={isMove} setIsMove={setIsMove} data={data} changeDate={changeDate} tiles={tiles} userToken={userToken} isChangeItemPlace={isChangeItemPlace} setIsChangeItemPlace={setIsChangeItemPlace} />
      </View>
      <MainPageInventory changedIndex={changedIndex} setChangedIndex={setChangedIndex} itemInfo={itemInfo} setItemInfo={setItemInfo} isChangeItemPlace={isChangeItemPlace} setIsChangeItemPlace={setIsChangeItemPlace} setIsMove={setIsMove} myItems={myItems} setMyItems={setMyItems} goldStatus={goldStatus} setGoldStatus={setGoldStatus} />
    </View>
  );
}

// <View style={styles.container}>

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // flexDirection: 'column',
    height: '100%',
  },
  devbutton: {
    position: 'absolute',
    top: 100,
    left: '70%',
    zIndex: 100,
    backgroundColor: 'black',
  },
  logoutButton: {
    position: 'absolute',
    right: 0,
    top: 25,
    zIndex: 100
  },
  containerTop: {
    // flex: 1,
    // justifyContent: 'flex-start',
    height: "50%"
  },
  infoContainer: {
    position: "relative",
    // height: "10%",
  }
});
