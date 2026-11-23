import { memo } from 'react'
import { View, TouchableOpacity } from 'react-native'

import Section from '../components/Section'
// import Button from './components/Button'

import { createStyle, openUrl } from '@/utils/tools'
// import { showPactModal } from '@/navigation'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import Text from '@/components/common/Text'
import { showPactModal } from '@/core/common'

// const qqGroupUrl = 'mqqopensdkapi://bizAgent/qm/qr?url=http%3A%2F%2Fqm.qq.com%2Fcgi-bin%2Fqm%2Fqr%3Ffrom%3Dapp%26p%3Dandroid%26jump_from%3Dwebapi%26k%3Du1zyxek8roQAwic44nOkBXtG9CfbAxFw'
// const qqGroupUrl2 = 'mqqopensdkapi://bizAgent/qm/qr?url=http%3A%2F%2Fqm.qq.com%2Fcgi-bin%2Fqm%2Fqr%3Ffrom%3Dapp%26p%3Dandroid%26jump_from%3Dwebapi%26k%3D-l4kNZ2bPQAuvfCQFFhl1UoibvF5wcrQ'
// const qqGroupWebUrl = 'https://qm.qq.com/cgi-bin/qm/qr?k=jRZkyFSZ4FmUuTHA3P_RAXbbUO_Rrn5e&jump_from=webapi'
// const qqGroupWebUrl2 = 'https://qm.qq.com/cgi-bin/qm/qr?k=HPNJEfrZpBZ9T8szYWbe2d5JrAAeOt_l&jump_from=webapi'

export default memo(() => {
  const theme = useTheme()
  const t = useI18n()
  const openHomePage = () => {
    void openUrl('https://github.com/lyswhut/lx-music-mobile#readme')
  }
  const openIssuePage = () => {
    void openUrl('https://github.com/lyswhut/lx-music-mobile/issues?q=is%3Aissue+')
  }
  const openFAQPage = () => {
    void openUrl('https://lyswhut.github.io/lx-music-doc/mobile/faq')
  }
  // const openIssuesPage = () => {
  //   openUrl('https://github.com/lyswhut/lx-music-mobile/issues')
  // }
  const openPactModal = () => {
    showPactModal()
  }
  const openPartPage = () => {
    void openUrl('https://github.com/lyswhut/lx-music-mobile#%E9%A1%B9%E7%9B%AE%E5%8D%8F%E8%AE%AE')
  }

  // const goToQQGroup = () => {
  //   openUrl(qqGroupUrl).catch(() => {
  //     void openUrl(qqGroupWebUrl)
  //   })
  // }
  // const goToQQGroup2 = () => {
  //   openUrl(qqGroupUrl2).catch(() => {
  //     void openUrl(qqGroupWebUrl2)
  //   })
  // }

  const textLinkStyle = {
    ...styles.text,
    textDecorationLine: 'underline',
    color: theme['c-primary-font'],
    // fontSize: 14,
  } as const


  return (
    <Section title={t('setting_about')}>
      <View style={styles.part}>
        <Text style={styles.text} >本應用程式完全免費，原始碼已公開。專案原始碼：</Text>
        <TouchableOpacity onPress={openHomePage}>
          <Text style={textLinkStyle}>https://github.com/lyswhut/lx-music-mobile</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.part}>
        <Text style={styles.text} >常見問題請參閱：</Text>
        <TouchableOpacity onPress={openFAQPage}>
          <Text style={textLinkStyle}>行動版常見問題</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}><Text style={styles.boldText}>本應用程式沒有客服</Text>，，但我們整理了常見的使用問題。<Text style={styles.boldText} >務必仔細閱讀</Text>地阅读常见问题后，</Text>
        <Text style={styles.text}>若仍有疑問，可至 GitHub </Text>
        <TouchableOpacity onPress={openIssuePage}>
          <Text style={textLinkStyle}>回報問題（Issue）</Text>
        </TouchableOpacity>
        <Text style={styles.text}>。</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>本專案最初是為了學習與研究新技術而開發，因此即使停止維護，也會維持純淨、不加入廣告。</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>本專案唯一的原始發布管道<Text style={styles.boldText}>只有 GitHub</Text>，其他管道皆為第三方轉載，請自行判斷可信度。</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}><Text style={styles.boldText}>本專案沒有微信公眾號等所謂的「官方帳號」，也未在小米、華為、vivo 等應用商店上架同名應用，請提高警覺，以免受騙！</Text></Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>若使用時遇到<Text style={styles.boldText}>廣告</Text>或<Text style={styles.boldText}>導流</Text>訊息（例如要求加入群組、追蹤公眾號才能使用或更新），表示目前使用的可能是「第三方修改版」。</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>若安裝新版時出現「<Text style={styles.boldText}>簽章不一致</Text>」提示，表示手機上的舊版或準備安裝的新版中<Text style={styles.boldText}>其中一方</Text>可能是「<Text style={styles.boldText}>第三方修改版</Text>」。</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>你已簽署本應用程式的</Text>
        <TouchableOpacity onPress={openPactModal}><Text style={styles.text} color={theme['c-primary-font']}>许可协议</Text></TouchableOpacity>
        <Text style={styles.text}>，協議的線上版本請參閱</Text>
        <TouchableOpacity onPress={openPartPage}><Text style={textLinkStyle}>這裡</Text></TouchableOpacity>
        <Text style={styles.text}>。</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>By: </Text>
        <Text style={styles.text}>落雪无痕</Text>
      </View>
    </Section>
  )
})

const styles = createStyle({
  part: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 14,
    textAlignVertical: 'bottom',
  },
  boldText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlignVertical: 'bottom',
  },
  throughText: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    textAlignVertical: 'bottom',
  },
  btn: {
    flexDirection: 'row',
  },
})
