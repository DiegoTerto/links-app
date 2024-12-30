import { View, Image, TouchableOpacity, FlatList, Modal, Text, Alert, Linking } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { router, useFocusEffect } from "expo-router"

import { styles } from "./styles"
import { colors } from "@/styles/colors"
import { Categories } from "@/components/categories"
import { Link } from "@/components/link"
import { Option } from "@/components/option"
import { useCallback, useState } from "react"
import { categories } from "@/utils/categories"
import { LinkStorage, linkStorage } from "@/storage/link-storage"

export default function Index() {
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState<string>(categories[0].name)
  const [links, setLinks] = useState<LinkStorage[]>([])
  const [linkSelected, setLinkSelected] = useState<LinkStorage>();

  async function getLinks() {
    try {
      const response = await linkStorage.get();
      const filtered = response.filter(link => link.category === category)
      setLinks(filtered)
    }catch(error) {
      Alert.alert('Erro', 'Não foi possível listar os links')
    }
  }

  function handleDetails(selected: LinkStorage) {
    setShowModal(true)
    setLinkSelected(selected)
  }

  async function removeLink() {
    try {
      await linkStorage.remove(linkSelected?.id ?? '')
      getLinks()
      setShowModal(false);
    } catch(error) {
      Alert.alert('Erro', 'Não foi possível excluir!')
      console.error(error)
    }
  }

  function handleRemove() {
    Alert.alert('Excluir', 'Deseja realmente excluir', [
      { style: 'cancel', text: 'Não'},
      { text: 'Sim', onPress: removeLink},
    ])
  }

  async function handleOpen() {
    try {
      await Linking.openURL(linkSelected?.url ?? '')
      setShowModal(false);
    } catch(error) {
      Alert.alert('Erro', 'Não foi possível abrir o link!')
      console.error(error)
    }
  }

  useFocusEffect(useCallback(() => {
    getLinks()
  }, [category]))

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("@/assets/logo.png")} style={styles.logo}/>
        <TouchableOpacity onPress={() => router.navigate('./add')}>
          <MaterialIcons name="add" size={32} color={colors.green[300]}/>
        </TouchableOpacity>
      </View>
      <Categories selected={category} onChange={setCategory}/>
    
      <FlatList
        data={links}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <Link
            name={item.name}
            url={item.url}
            onDetails={() => handleDetails(item)}
          />
        )}
        style={styles.links}
        contentContainerStyle={styles.linksContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal transparent visible={showModal} animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalCategory}>{linkSelected?.category}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialIcons name="close" size={20} color={colors.gray[400]}/>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLinkName}>
              {linkSelected?.name}
            </Text>
            <Text style={styles.modalUrl}>
            {linkSelected?.url}
            </Text>
            <View style={styles.modalFooter}>
              <Option name="Excluir" icon="delete" variant="secondary" onPress={handleRemove}/>
              <Option name="Abrir" icon="language" onPress={handleOpen}/>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}