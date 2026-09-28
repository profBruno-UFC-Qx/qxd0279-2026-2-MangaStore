import { ref } from 'vue'
import { AlertType } from '@/types'

export function useAlert() {
  const alertMessage = ref<string | null>(null)
  const alertType = ref<AlertType>(AlertType.Danger)

  function showAlert(message: string, type: AlertType = AlertType.Danger) {
    alertType.value = type
    alertMessage.value = message
  }

  function showError(error: unknown) {
    showAlert((error as Error).message)
  }

  return { alertMessage, alertType, showAlert, showError }
}
