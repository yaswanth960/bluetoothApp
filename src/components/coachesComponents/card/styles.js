import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    card: {
      padding: 16,
      marginBottom: 16,
      backgroundColor: '#fff',
      borderRadius: 8,
      elevation: 2,
    },
    image: {
      width: 200,
      height: 250,
      borderRadius: 8,
    },
    details: {
      marginLeft: 16,
      justifyContent: 'space-around',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'black',
    },
    description: {
      fontSize: 20,
      color: 'black',
    },
    button: {
      paddingHorizontal: 30,
      paddingVertical: 7,
      borderColor: 'red',
      borderWidth: 1,
      borderRadius: 25,
    },
    buttonText: {
      color: 'red',
      fontSize: 20,
      fontWeight: '600',
    },
    bottomContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginTop: '2%',
    },
  });