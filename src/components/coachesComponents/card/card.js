import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import { styles } from './styles';


const Card = ({item, data, index}) => {
  const desiredOrder = ['value1', 'value2', 'value3'];
//   const keys = Object.keys(data);
  const result = desiredOrder.map(key => ({value: data[key]}));

  const backgroundcolor = () => {
    return result[index]?.value === 'busy' ? 'red' :'yellow'
  }

  return (
    <View style={styles.card}>
      <View style={{flexDirection: 'row'}}>
        <Image source={{uri: item?.imageUrl}} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.title}>{item?.username}</Text>
          <Text style={styles.description}>{item?.sessions} sessions</Text>
          <Text style={styles.description}>{item?.languages[0]}</Text>
          <Text style={styles.description}>{item?.songType}</Text>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Text style={styles.description}>{item?.overallRating} star</Text>
        <Text style={styles.description}> {`(${item?.numberOfRatings}) ratings`}</Text>
        <Text style={styles.description}> {`${item?.songPrice} rupees`}</Text>
        <Text style={styles.description}> {`${item?.songDuration} / min`}</Text>
        <TouchableOpacity style={[styles.button,{backgroundColor: result[index]?.value === 'connect' ? 'green' : backgroundcolor()}]}>
          <Text style={styles.buttonText}>{result[index]?.value}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



export default Card;
