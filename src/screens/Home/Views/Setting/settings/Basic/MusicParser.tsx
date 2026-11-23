import { memo, useEffect, useRef, useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import Text from '@/components/common/Text'
import Input from '@/components/common/Input'
import Dialog, { type DialogType } from '@/components/common/Dialog'
import CheckBox from '@/components/common/CheckBox'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import SubTitle from '../../components/SubTitle'
import Button from '../../components/Button'
import {
  getMusicParserProfiles,
  saveMusicParserProfiles,
  testMusicParserProfile,
  type MusicParserProfile,
} from '@/utils/musicParser'
import { createStyle } from '@/utils/tools'

const createProfile = (): MusicParserProfile => ({
  id: String(Date.now()),
  name: '',
  format: 'json',
  url: '',
  method: 'GET',
  enabled: true,
  timeout: 10000,
  responsePath: '',
  params: {},
  headers: {},
  body: '',
  sourceParam: 'source',
  idParam: 'id',
  qualityParam: 'quality',
})

const Field = ({ label, value, onChangeText, placeholder, multiline = false }: {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  multiline?: boolean
}) => {
  const theme = useTheme()
  return (
    <View style={styles.field}>
      <Text size={12} style={styles.fieldLabel}>{label}</Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={{ ...styles.input, backgroundColor: theme['c-primary-input-background'], height: multiline ? 66 : 34 }}
      />
    </View>
  )
}

export default memo(() => {
  const t = useI18n()
  const theme = useTheme()
  const dialogRef = useRef<DialogType>(null)
  const [visible, setVisible] = useState(false)
  const [profiles, setProfiles] = useState<MusicParserProfile[]>([])
  const [form, setForm] = useState<MusicParserProfile | null>(null)
  const [paramsText, setParamsText] = useState('{}')
  const [headersText, setHeadersText] = useState('{}')
  const [testing, setTesting] = useState(false)

  const refresh = async() => {
    setProfiles(await getMusicParserProfiles())
  }
  useEffect(() => { void refresh() }, [])

  const show = () => {
    setVisible(true)
    requestAnimationFrame(() => dialogRef.current?.setVisible(true))
    void refresh()
  }
  const updateForm = (key: keyof MusicParserProfile, value: any) => {
    setForm(current => current ? { ...current, [key]: value } : current)
  }
  const edit = (profile: MusicParserProfile) => {
    setForm({ ...profile })
    setParamsText(JSON.stringify(profile.params ?? {}, null, 2))
    setHeadersText(JSON.stringify(profile.headers ?? {}, null, 2))
  }
  const add = () => {
    const profile = createProfile()
    setForm(profile)
    setParamsText('{}')
    setHeadersText('{}')
  }
  const save = async() => {
    if (!form?.name.trim() || !form.url.trim()) {
      Alert.alert(t('music_parser_title'), t('music_parser_required'))
      return
    }
    try {
      const params = JSON.parse(paramsText || '{}')
      const headers = JSON.parse(headersText || '{}')
      if (!params || Array.isArray(params) || typeof params !== 'object' || !headers || Array.isArray(headers) || typeof headers !== 'object') {
        throw new Error('JSON 必須是物件')
      }
      const next = profiles.some(item => item.id === form.id)
        ? profiles.map(item => item.id === form.id ? { ...form, params, headers } : item)
        : [...profiles, { ...form, params, headers }]
      await saveMusicParserProfiles(next)
      setProfiles(next)
      setForm(null)
    } catch (error: any) {
      Alert.alert(t('music_parser_title'), error?.message ?? t('music_parser_invalid_json'))
    }
  }
  const toggle = async(profile: MusicParserProfile, enabled: boolean) => {
    const next = profiles.map(item => item.id === profile.id ? { ...item, enabled } : item)
    setProfiles(next)
    await saveMusicParserProfiles(next)
  }
  const remove = async(profile: MusicParserProfile) => {
    const next = profiles.filter(item => item.id !== profile.id)
    setProfiles(next)
    await saveMusicParserProfiles(next)
    if (form?.id === profile.id) setForm(null)
  }
  const test = async() => {
    if (!form) return
    setTesting(true)
    try {
      const result = await testMusicParserProfile({
        ...form,
        params: JSON.parse(paramsText || '{}'),
        headers: JSON.parse(headersText || '{}'),
      })
      Alert.alert(t('music_parser_test'), result.url)
    } catch (error: any) {
      Alert.alert(t('music_parser_test_failed'), error?.message ?? String(error))
    } finally {
      setTesting(false)
    }
  }

  return (
    <SubTitle title={t('music_parser_title')}>
      <View style={styles.row}>
        <Text style={styles.description} size={12} color={theme['c-font-label']}>{t('music_parser_desc')}</Text>
        <Button onPress={show}>{t('music_parser_manage')}</Button>
      </View>
      {visible
        ? (
            <Dialog ref={dialogRef} title={t('music_parser_manage')} bgHide={false} onHide={() => { setVisible(false); setForm(null) }}>
              <View style={styles.dialogContent}>
                {form
                  ? (
                      <ScrollView keyboardShouldPersistTaps="always">
                        <Field label={t('music_parser_name')} value={form.name} onChangeText={value => updateForm('name', value)} />
                        <View style={styles.row}>
                          <Button onPress={() => updateForm('format', 'json')}>{form.format === 'json' ? '✓ ' : ''}JSON API</Button>
                          <Button onPress={() => updateForm('format', 'meting')}>{form.format === 'meting' ? '✓ ' : ''}Meting</Button>
                        </View>
                        <Field label={t('music_parser_url')} value={form.url} onChangeText={value => updateForm('url', value)} placeholder="https://api.example.com/..." />
                        <View style={styles.row}>
                          <Button onPress={() => updateForm('method', 'GET')}>{form.method === 'GET' ? '✓ ' : ''}GET</Button>
                          <Button onPress={() => updateForm('method', 'POST')}>{form.method === 'POST' ? '✓ ' : ''}POST</Button>
                        </View>
                        <Field label={t('music_parser_response_path')} value={form.responsePath} onChangeText={value => updateForm('responsePath', value)} placeholder="data.url（可留空自動判斷）" />
                        <Field label={t('music_parser_params')} value={paramsText} onChangeText={setParamsText} multiline />
                        <Field label={t('music_parser_headers')} value={headersText} onChangeText={setHeadersText} multiline />
                        {form.method === 'POST'
                          ? <Field label={t('music_parser_body')} value={form.body} onChangeText={value => updateForm('body', value)} multiline />
                          : null}
                        <Field label={t('music_parser_timeout')} value={String(form.timeout)} onChangeText={value => updateForm('timeout', Number(value) || 10000)} />
                        <CheckBox check={form.enabled} label={t('music_parser_enabled')} onChange={value => updateForm('enabled', value)} />
                      </ScrollView>
                    )
                  : (
                      <ScrollView keyboardShouldPersistTaps="always">
                        {profiles.length
                          ? profiles.map(profile => (
                              <View key={profile.id} style={styles.profileRow}>
                                <View style={styles.profileInfo}>
                                  <Text>{profile.name}</Text>
                                  <Text size={11} color={theme['c-font-label']}>{profile.format.toUpperCase()} · {profile.method} · {profile.url}</Text>
                                  <CheckBox check={profile.enabled} label={t('music_parser_enabled')} onChange={value => { void toggle(profile, value) }} />
                                </View>
                                <View style={styles.profileActions}>
                                  <Button onPress={() => edit(profile)}>{t('edit')}</Button>
                                  <Button onPress={() => { void remove(profile) }}>{t('delete')}</Button>
                                </View>
                              </View>
                            ))
                          : <Text style={styles.empty} color={theme['c-font-label']}>{t('music_parser_empty')}</Text>}
                      </ScrollView>
                    )}
              </View>
              <View style={styles.actions}>
                {form
                  ? (
                      <>
                        <Button onPress={() => setForm(null)}>{t('cancel')}</Button>
                        <Button disabled={testing} onPress={() => { void test() }}>{testing ? t('loading') : t('music_parser_test')}</Button>
                        <Button onPress={() => { void save() }}>{t('confirm')}</Button>
                      </>
                    )
                  : (
                      <>
                        <Button onPress={add}>{t('music_parser_add')}</Button>
                        <Button onPress={() => dialogRef.current?.setVisible(false)}>{t('close')}</Button>
                      </>
                    )}
              </View>
            </Dialog>
          )
        : null}
    </SubTitle>
  )
})

const styles = createStyle({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 },
  description: { flex: 1, marginRight: 8 },
  dialogContent: { padding: 10, maxHeight: '70%' },
  field: { marginBottom: 10 },
  fieldLabel: { marginBottom: 4 },
  input: { borderRadius: 4, paddingHorizontal: 7, maxWidth: 520 },
  profileRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.2)' },
  profileInfo: { flex: 1, paddingRight: 8 },
  profileActions: { flexDirection: 'row' },
  actions: { flexDirection: 'row', justifyContent: 'center', padding: 10, flexWrap: 'wrap' },
  empty: { textAlign: 'center', padding: 20 },
})
