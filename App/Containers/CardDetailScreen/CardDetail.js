import React from 'react'
import { Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import { connect } from 'react-redux'
import FastImage from 'react-native-fast-image'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import moment from 'moment'

import { getMaxStats } from '../../Stores/CachedData/Selectors'
import Seperator from '../../Components/Seperator/Seperator'
import ProgressBar from '../../Components/ProgressBar/ProgressBar'
import SquareButton from '../../Components/SquareButton/SquareButton'
import TextRow from '../../Components/TextRow/TextRow'
import SplashScreen from '../SplashScreen/SplashScreen'
import { findColorByAttribute, AddHTTPS, findMainUnit, findSubUnit } from '../../Utils'
import { Metrics, Fonts, ApplicationStyles, Colors, Images } from '../../Theme'
import styles from './styles'

/**
 * Card detail screen
 * 
 * State:
 * - `item`: Card object
 * - `imgWidth`: Image width
 * - `imgHeight`: Image height
 * - `colors`: Colors for background
 * - `isLoading`: Check loading
 * - `maxStats`: Maximum stats
 * - `minStats`: Minimal stats
 * - `nonIdolMaxStats`: Non-idolized maximum stats
 * - `idolMaxStats`: Idolized maximum stats
 * - `currentStats`: To show stats when choosing Level
 * - `buttonID`: ID for choosing Level button
 *
 * @class CardDetailScreen
 * @extends {React.Component}
 */
class CardDetailScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      item: this.props.navigation.getParam('item'),
      imgWidth: 0,
      imgHeight: 0,
      colors: [],
      isLoading: true,
      maxStats: null,
      minStats: [],
      nonIdolMaxStats: [],
      idolMaxStats: [],
      currentStats: [],
      buttonID: 0
    }
  }

  componentDidMount() {
    this.setState({
      isLoading: false,
      colors: findColorByAttribute(this.state.item.attribute),
      maxStats: [
        this.props.maxStats.get('Smile'),
        this.props.maxStats.get('Pure'),
        this.props.maxStats.get('Cool')
      ],
      minStats: [
        this.state.item.minimum_statistics_smile,
        this.state.item.minimum_statistics_pure,
        this.state.item.minimum_statistics_cool
      ],
      nonIdolMaxStats: [
        this.state.item.non_idolized_maximum_statistics_smile,
        this.state.item.non_idolized_maximum_statistics_pure,
        this.state.item.non_idolized_maximum_statistics_cool
      ],
      idolMaxStats: [
        this.state.item.idolized_maximum_statistics_smile,
        this.state.item.idolized_maximum_statistics_pure,
        this.state.item.idolized_maximum_statistics_cool
      ],
      currentStats: [
        this.state.item.minimum_statistics_smile,
        this.state.item.minimum_statistics_pure,
        this.state.item.minimum_statistics_cool
      ]
    })
    console.log('CardDetails.state.item', this.state.item)
  }

  progressSmile(stat) {
    return 100 * stat / this.state.maxStats[0]
  }

  progressPure(stat) {
    return 100 * stat / this.state.maxStats[1]
  }

  progressCool(stat) {
    return 100 * stat / this.state.maxStats[2]
  }

  progressUnit(text, stat, color) {
    var icon = function (text) {
      switch (text) {
        case 'Smile':
          return 0
        case 'Pure':
          return 1
        default:
          return 2
      }
    }
    return (
      <View style={{ width: '100%' }}>
        <Text style={[Fonts.style.normal, styles.progressText]}>{text}</Text>
        <View style={styles.progressRow}>
          <Image source={Images.attribute[icon(text)]}
            style={[ApplicationStyles.mediumIcon, { marginRight: 10 }]} />
          <ProgressBar
            number={stat}
            progress={this.progressSmile(stat)}
            fillStyle={{ backgroundColor: color }} />
        </View>
      </View>
    )
  }

  progressView(stats) {
    return (
      <View>
        {this.progressUnit('Smile', stats[0], Colors.pink)}
        {this.progressUnit('Pure', stats[1], Colors.green)}
        {this.progressUnit('Cool', stats[2], Colors.blue)}
      </View>
    )
  }

  statButton(id, text, stats, style) {
    return (
      <TouchableOpacity onPress={() => this.setState({ currentStats: stats, buttonID: id })}
        style={[
          styles.button, style,
          { backgroundColor: this.state.buttonID === id ? Colors.violet : Colors.inactive }
        ]}>
        <Text style={[Fonts.style.normal, { color: 'white' }]}>{text}</Text>
      </TouchableOpacity>
    )
  }

  _onLoadFastImage(e) {
    const { width, height } = e.nativeEvent
    this.setState({ imgWidth: width, imgHeight: height })
  }

  /**
   * Navigate to Event Detail Screen
   * 
   * @param {String} name Event name
   * @memberof CardDetailScreen
   */
  _navigateToEventDetail = (name) => () => this.props.navigation.navigate('EventDetailScreen', { eventName: name })

  /**
   * Navigate to Idol Detail Screen
   * 
   * @param {String} name Idol name
   * @memberof CardDetailScreen
   */
  _navigateToIdolDetail = (name) => () => this.props.navigation.navigate('IdolDetailScreen', { name: name })

  _renderImage = (props) => {
    let propss = props
    return <FastImage source={{ uri: props.source.uri }} />
  }

  render() {
    if (this.state.isLoading) return <SplashScreen />
    let images = []
    if (this.state.item.card_image !== null) images.push({ url: AddHTTPS(this.state.item.card_image) })
    images.push({ url: AddHTTPS(this.state.item.card_idolized_image) })
    return (
      <View style={styles.container}>
        {/* HEADER */}
        <View style={[
          ApplicationStyles.header,
          styles.header,
          { backgroundColor: this.state.colors[1] }
        ]}>
          <View style={styles.leftHeader}>
            <SquareButton name={'ios-arrow-back'} onPress={() => this.props.navigation.goBack()} />
          </View>
          <View style={styles.centerHeader}>
            <TouchableOpacity
              onPress={this._navigateToIdolDetail(this.state.item.idol.name)}>
              <Text style={Fonts.style.normal}>{this.state.item.idol.name}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rightHeader}>
            <Image source={findMainUnit(this.state.item.idol.main_unit)}
              style={styles.rightHeaderImage} />
            <Image source={findSubUnit(this.state.item.idol.sub_unit)}
              style={styles.rightHeaderImage} />
          </View>
        </View>

        {/* MAIN VIEW */}
        <LinearGradient style={{ flex: 1 }}
          colors={[this.state.colors[1], this.state.colors[0], 'white']}>
          <ScrollView showsVerticalScrollIndicator={false}
            style={styles.scrollView}>

            {/* CARD IMAGES */}
            <View style={styles.imageRow}>
              {this.state.item.card_image !== null &&
                <TouchableOpacity onPress={() => this.props.navigation.navigate('ImageViewerScreen', { index: 0, images: images })}>
                  <FastImage source={{ uri: AddHTTPS(this.state.item.card_image) }}
                    style={{
                      width: Metrics.images.itemWidth,
                      height: Metrics.images.itemWidth * this.state.imgHeight / this.state.imgWidth
                    }}
                    onLoad={e => this._onLoadFastImage(e)} />
                </TouchableOpacity>}
              <TouchableOpacity onPress={() => this.props.navigation.navigate('ImageViewerScreen', { index: images.length - 1, images: images })}>
                <FastImage source={{ uri: AddHTTPS(this.state.item.card_idolized_image) }}
                  style={{
                    width: Metrics.images.itemWidth,
                    height: Metrics.images.itemWidth * this.state.imgHeight / this.state.imgWidth
                  }}
                  onLoad={e => this._onLoadFastImage(e)} />
              </TouchableOpacity>
            </View>

            {/* INFORMATION */}
            <View style={{ paddingHorizontal: Metrics.doubleBaseMargin }}>
              <TextRow
                item1={{ flex: 1, text: 'Card ID' }}
                item2={{ flex: 2, text: this.state.item.game_id }} />
              <TextRow
                item1={{ flex: 1, text: 'Release date' }}
                item2={{ flex: 2, text: moment(this.state.item.release_date).format('MMM Do YYYY') }} />
              <View style={{ flexDirection: 'row' }}>
                {this.state.item.is_promo && <Text>Promo card</Text>}
                {this.state.item.is_promo && this.state.item.japan_only && <Text> - </Text>}
                {this.state.item.japan_only && <Text>Japan only</Text>}
              </View>

              {(this.state.item.skill !== null && this.state.item.skill.length !== 0) &&
                <View>
                  <Seperator />
                  <TextRow
                    item1={{ flex: 1, text: 'Skill' }}
                    item2={{ flex: 2, text: this.state.item.skill }} />
                  <TextRow
                    item1={{ flex: 1, text: '' }}
                    item2={{ flex: 2, text: this.state.item.skill_details, textStyle: styles.subtitleText }} />
                </View>}

              {(this.state.item.center_skill !== null && this.state.item.center_skill.length !== 0) &&
                <View>
                  <Seperator />
                  <TextRow
                    item1={{ flex: 1, text: 'Center skill' }}
                    item2={{ flex: 2, text: this.state.item.center_skill }} />
                  <TextRow
                    item1={{ flex: 1, text: '' }}
                    item2={{ flex: 2, text: this.state.item.center_skill_details, textStyle: styles.subtitleText }} />
                </View>}

              {this.state.item.event !== null &&
                <View>
                  <Seperator />
                  <TextRow item1={{ text: 'Event', flex: 1, textStyle: Fonts.style.normal }}
                    item2={{ text: this.state.item.event.japanese_name, flex: 4, textStyle: Fonts.style.normal }} />
                  <TextRow item1={{ text: '', flex: 1, textStyle: Fonts.style.normal }}
                    item2={{ text: this.state.item.event.english_name, flex: 4, textStyle: Fonts.style.normal }} />
                  <TouchableOpacity style={ApplicationStyles.center}
                    onPress={this._navigateToEventDetail(this.state.item.event.japanese_name)}>
                    <FastImage source={{ uri: AddHTTPS(this.state.item.event.image) }}
                      style={styles.banner}
                      resizeMode={FastImage.resizeMode.contain} />
                  </TouchableOpacity>
                </View>}

              {this.state.item.hp !== 0 &&
                <View>
                  <Seperator />
                  <View style={{ flexDirection: 'row' }}>
                    <Icon name='ios-heart' size={Metrics.icons.medium} color={'red'} />
                    <Text style={Fonts.style.normal}> : {this.state.item.hp}</Text>
                  </View>
                </View>}
            </View>

            {/* STATS */}
            {this.state.item.hp !== 0 &&
              <View>
                <View style={styles.buttonRow}>
                  {this.statButton(0, 'Level 1', this.state.minStats, styles.leftRadius)}
                  {this.state.item.non_idolized_maximum_statistics_smile !== 0 &&
                    this.statButton(1, `Level ${this.state.item.non_idolized_max_level}`, this.state.nonIdolMaxStats)}
                  {this.state.item.idolized_max_level !== 0 &&
                    this.statButton(2, `Level ${this.state.item.idolized_max_level}`, this.state.idolMaxStats, styles.rightRadius)}
                </View>
                {this.progressView(this.state.currentStats)}
              </View>}
            <View style={{ height: Metrics.doubleBaseMargin }} />
          </ScrollView>
        </LinearGradient>
      </View>
    )
  }
}

const mapStateToProps = (state) => ({ maxStats: getMaxStats(state) })
const mapDispatchToProps = (dispatch) => ({})
export default connect(mapStateToProps, mapDispatchToProps)(CardDetailScreen)
