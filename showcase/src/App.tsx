import { useState, useRef } from 'react';
import Button from '../../src/components/html/Button';
import Input from '../../src/components/html/Input';
import Form from '../../src/components/html/Form';
import Select from '../../src/components/html/Select';
import Table from '../../src/components/html/Table';
import Modal, { ModalRef } from '../../src/components/html/Modal';
import ThemeToggle from '../../src/components/theme/ThemeToggle';
import { useTheme } from '../../src/context/theme/useTheme';
import {
  HomeIcon,
  SaveIcon,
  DeleteIcon,
  EditIcon,
  SearchIcon,
  CheckIcon,
  CloseIcon,
  AddIcon,
  SpinnerIcon
} from '../../src/components/icons/icons';
import {
  AlertaExito,
  AlertaError,
  AlertaAdvertencia,
  AlertaConfirmacion,
  AlertaToast
} from '../../src/components/alerts/alerta';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const modalRef = useRef<ModalRef>(null);
  const { theme, setTheme } = useTheme();

  const handleAlertaExito = () => {
    AlertaExito('¡Éxito!', 'La operación se completó correctamente');
  };

  const handleAlertaError = () => {
    AlertaError('Error', 'Ocurrió un error al procesar la solicitud');
  };

  const handleAlertaAdvertencia = () => {
    AlertaAdvertencia(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer',
      () => AlertaToast('Confirmado', 'Acción ejecutada', 'success'),
      () => AlertaToast('Cancelado', 'Acción cancelada', 'info')
    );
  };

  const handleAlertaConfirmacion = () => {
    AlertaConfirmacion(
      'Confirmar acción',
      '¿Deseas continuar con esta operación?',
      () => console.log('Confirmado'),
      () => console.log('Cancelado')
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    AlertaToast('Formulario enviado', `Valor: ${inputValue}`, 'success');
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              UI Components Showcase
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Biblioteca de componentes reutilizables con React, Tailwind y SweetAlert
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Buttons Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Botones</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="link">Link Button</Button>
            <Button variant="primary" isLoading loadingText="Guardando...">
              Loading
            </Button>
            <Button variant="icon">
              <HomeIcon className="w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Icons Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Iconos</h2>
          <div className="grid grid-cols-6 gap-4">
            <div className="flex flex-col items-center">
              <HomeIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Home</span>
            </div>
            <div className="flex flex-col items-center">
              <SaveIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Save</span>
            </div>
            <div className="flex flex-col items-center">
              <DeleteIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Delete</span>
            </div>
            <div className="flex flex-col items-center">
              <EditIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Edit</span>
            </div>
            <div className="flex flex-col items-center">
              <SearchIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Search</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Check</span>
            </div>
            <div className="flex flex-col items-center">
              <CloseIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Close</span>
            </div>
            <div className="flex flex-col items-center">
              <AddIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Add</span>
            </div>
            <div className="flex flex-col items-center">
              <SpinnerIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">Spinner</span>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Formularios</h2>
          <Form onSubmit={handleSubmit} className="max-w-md">
            <Input
              label="Nombre"
              type="text"
              placeholder="Ingresa tu nombre"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="Este campo es obligatorio"
            />
            <Input
              label="Email"
              type="email"
              placeholder="correo@ejemplo.com"
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              error="La contraseña debe tener al menos 8 caracteres"
            />
            <Select
              label="País"
              placeholder="Selecciona un país"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              options={[
                { value: 'mx', label: 'México' },
                { value: 'ar', label: 'Argentina' },
                { value: 'cl', label: 'Chile' },
                { value: 'co', label: 'Colombia' }
              ]}
            />
            <Input
              type="checkbox"
              label="Acepto los términos y condiciones"
            />
            <div className="flex gap-2">
              <Button variant="primary" type="submit">
                Enviar
              </Button>
              <Button variant="secondary" type="button">
                Cancelar
              </Button>
            </div>
          </Form>
        </section>

        {/* Table Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tablas</h2>
          <Table
            headers={['ID', 'Nombre', 'Email', 'Rol', 'Acciones']}
            rows={[
              ['1', 'Juan Pérez', 'juan@ejemplo.com', 'Admin',
                <div className="flex gap-2" key="actions-1">
                  <Button variant="icon"><EditIcon className="w-4 h-4" /></Button>
                  <Button variant="icon"><DeleteIcon className="w-4 h-4" /></Button>
                </div>
              ],
              ['2', 'María García', 'maria@ejemplo.com', 'Usuario',
                <div className="flex gap-2" key="actions-2">
                  <Button variant="icon"><EditIcon className="w-4 h-4" /></Button>
                  <Button variant="icon"><DeleteIcon className="w-4 h-4" /></Button>
                </div>
              ],
              ['3', 'Carlos López', 'carlos@ejemplo.com', 'Usuario',
                <div className="flex gap-2" key="actions-3">
                  <Button variant="icon"><EditIcon className="w-4 h-4" /></Button>
                  <Button variant="icon"><DeleteIcon className="w-4 h-4" /></Button>
                </div>
              ]
            ]}
          />
        </section>

        {/* Modal Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Modal</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Abrir Modal
          </Button>
          {showModal && (
            <Modal
              ref={modalRef}
              title="Ejemplo de Modal"
              onClose={() => setShowModal(false)}
              footer={
                <>
                  <Button variant="secondary" onClick={() => modalRef.current?.handleClose()}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={() => {
                    AlertaToast('Modal', 'Acción confirmada', 'success');
                    modalRef.current?.handleClose();
                  }}>
                    Confirmar
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Este es un ejemplo de un modal con contenido personalizado.
                </p>
                <Input
                  label="Campo de ejemplo"
                  placeholder="Escribe algo aquí..."
                />
              </div>
            </Modal>
          )}
        </section>

        {/* Theme Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sistema de Tema</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <p className="text-gray-700 dark:text-gray-300">Tema actual: <strong>{theme}</strong></p>
              <ThemeToggle />
            </div>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" onClick={() => setTheme('light')}>
                Modo Claro
              </Button>
              <Button variant="secondary" onClick={() => setTheme('dark')}>
                Modo Oscuro
              </Button>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                El tema se guarda automáticamente en localStorage y persiste entre sesiones.
                Usa el hook <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">useTheme()</code> para acceder al tema y sus funciones.
              </p>
            </div>
          </div>
        </section>

        {/* Alerts Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Alertas (SweetAlert2)</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="success" onClick={handleAlertaExito}>
              Alerta Éxito
            </Button>
            <Button variant="danger" onClick={handleAlertaError}>
              Alerta Error
            </Button>
            <Button variant="warning" onClick={handleAlertaAdvertencia}>
              Alerta Advertencia
            </Button>
            <Button variant="primary" onClick={handleAlertaConfirmacion}>
              Alerta Confirmación
            </Button>
            <Button variant="secondary" onClick={() => AlertaToast('Toast', 'Este es un toast de ejemplo', 'info')}>
              Toast Notification
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
