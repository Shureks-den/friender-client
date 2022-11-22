import { Div, Text } from "@vkontakte/vkui"
import { Icon56InfoOutline } from '@vkontakte/icons';
import './EventPlaceholder.scss'


const EventPlaceholder = ({ text }) => {
  return (
    <Div className="info-wrapper">
      <Icon56InfoOutline />
      <Text>{text}</Text>
    </Div>
  )
}

export default EventPlaceholder;