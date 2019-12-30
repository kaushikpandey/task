import React, { Component } from 'react'
import {
    Text,
    View,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TouchableNativeFeedback,
    Image,
    Dimensions,
    TextInput,
    StyleSheet,
    AsyncStorage,
    FlatList,
    SectionList
} from 'react-native'
import Axios from 'axios';

const Touchable = Platform.OS == 'android' ? TouchableNativeFeedback : TouchableOpacity;
let { width, height } = Dimensions.get('window');

export default class Home extends Component {

    constructor(props) {
        super(props)
        this.state = {
            searchKeyword: '',
            isExpanded: false,
            expandedIndex: null,
            categoryData: [],
            subCategoryData: []
        }
    }

    async componentDidMount() {

        // await AsyncStorage.removeItem('data')
        let data = await AsyncStorage.getItem('data')
        console.log('async data', data)

        data != null ? this.setState(prevState => { return { categoryData: JSON.parse(data) } }) : this.getApiData();
        console.log('state data', this.state.categoryData)

    }

    getApiData = () => {
        Axios.get('https://api.myjson.com/bins/mbtzw')
            .then(async response => {
                console.log('get group resp', response)
                // this.setState({ spinner: false })                
                if (response.status == 200) {
                    console.log('success')
                    if (response.data.categories) {
                        try {

                            await AsyncStorage.setItem('data', JSON.stringify(response.data.categories));
                            // console.log('setted', await AsyncStorage.getItem('data'))
                        } catch (error) {
                            console.log('err occured', error)
                        }
                    }

                }
            })
            .catch(err => {
                console.log('catch block err', err);
            })
    }

    expandSection = (item, index) => {
        console.log('expand item ', item)
        this.setState(prevState => {
            console.log('prevstate', prevState)
            // if (prevState.expandedIndex == null) {
            return {
                subCategoryData: item,
                isExpanded: !this.state.isExpanded,
                expandedIndex: index
            }
            // }

        })
    }

    renderSubItems(item) {
        return (
            <View style={{
                borderTopWidth: 0.5,
                backgroundColor: '#fff',
                borderColor: '#DB7BA5',
                padding: 10

            }}>
                <Text>
                    {item}
                </Text>
            </View>
        )
    }

    renderSubCategories(item, index) {
        return (
            <View>
                <Touchable onPress={() => this.expandSection(item)}>
                    <View style={{
                        flexDirection: 'row',
                        backgroundColor: '#fff',
                        paddingVertical: 10,
                        justifyContent: 'space-between',
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%' }}>
                            <Text style={{ color: '#DB7BA5', fontSize: 20, paddingLeft: 10 }}>{item.subCategoryname}</Text>
                        </View>
                    </View>
                </Touchable>
                {
                    index == this.state.expandedIndex &&
                    <FlatList
                        data={item.items}
                        renderItem={({ item, index }) => this.renderSubItems(item, index)}
                    // keyExtractor={item => item.id}
                    // extraData={selected}
                    />

                }
            </View>
        );
    }

    renderCategories(item, index) {
        console.log('category item', item)
        return (
            <View>
                <Touchable onPress={() => this.expandSection(item.category.subcategories)}>
                    <View style={{
                        flexDirection: 'row',
                        backgroundColor: '#fff',
                        paddingVertical: 10,
                        justifyContent: 'space-between',
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%' }}>
                            <Image
                                source={require('../assets/images/food.png')}
                                style={{ width: (200 / width) * 100, height: (300 / height) * 100 }}
                                resizeMode='contain'
                            />
                            <Text style={{ color: '#DB7BA5', fontSize: 20 }}>{item.category.categoryName}</Text>
                        </View>
                        <Image
                            source={this.state.isExpanded ? require('../assets/images/up.png') : require('../assets/images/down.png')}
                            style={{ width: (200 / width) * 100, height: (300 / height) * 100, alignContent: 'flex-end' }}
                            resizeMode='contain'
                        />
                    </View>
                </Touchable>
                {
                    // this.state.expandedIndex == index &&
                    <FlatList
                        data={this.state.subCategoryData}
                        renderItem={({ item, index }) => this.renderSubCategories(item, index)}
                    // keyExtractor={item => item.id}
                    // extraData={selected}
                    />
                }
            </View>
        );
    }

    searchItem = (word) => {
        console.log('sub data', this.state.subCategoryData)
        let searchedWord = word.toLowerCase()
        console.log('keyword se', searchedWord)
        let resArray=[];
        try {
            this.state.categoryData.forEach(item => {
                item.category.subcategories.forEach(subItem => {
                    resArray = subItem.items.filter(itm => {
                        itm.includes(searchedWord)
                        return itm;
                    })

                })

            })
        } catch (error) {
            console.log('err', error)
        }

        console.log('final res', resArray)
    }

    render() {
        return (
            <SafeAreaView style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: '#EAE9EF'
            }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                // contentInsetAdjustmentBehavior="automatic"
                // style={styles.scrollView}
                >
                    <View style={{ backgroundColor: '#EAE9EF', }}>
                        <View style={{
                            width: width * 0.9,
                            // backgroundColor: '#ff0',
                            alignContent: 'center'
                        }}>
                            <View style={{ paddingVertical: 15 }}>
                                <Image
                                    source={require('../assets/images/close.png')}
                                    style={{ width: (200 / width) * 100, height: (300 / height) * 100 }}
                                    resizeMode='contain'
                                />
                            </View>
                            <View style={{ paddingVertical: 15 }}>
                                <Text style={{ fontSize: 30, fontWeight: '600' }}>Approved Food List</Text>
                            </View>
                            <View style={{ flexDirection: 'row', backgroundColor: '#E8EFF5', paddingVertical: 10 }}>
                                <Image
                                    source={require('../assets/images/search.png')}
                                    style={{ width: (200 / width) * 100, height: (300 / height) * 100 }}
                                    resizeMode='contain'
                                />
                                <TextInput
                                    placeholder={'Try Searching fat, sauces names...'}
                                    onChangeText={(text) => this.searchItem(text)}
                                    style={{ backgroundColor: '#E8EFF5', width:'100%' }} />
                            </View>

                            <FlatList
                                data={this.state.categoryData}
                                renderItem={({ item, index }) => this.renderCategories(item, index)}
                            // keyExtractor={item => item.id}
                            // extraData={selected}
                            />

                        </View>

                    </View>

                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({

})