import { useContext } from 'react';
import { useState } from 'react';
import { useAuth } from '../../context/simpleAuthContext';
import { Spin as Hamburger } from 'hamburger-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { PRIVACY, URL } from '../../config';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const MySwal = withReactContent(Swal);

export default function Navbar({ fixed }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    MySwal.fire({
      title: `Cerrar Sesión?`,
      text: 'Esto eliminará todos los datos importados.',
      icon: 'warning',
      iconColor: '#d33',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#464646',
      confirmButtonText: 'Cerrar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Show loading while clearing database
        MySwal.fire({
          title: 'Cerrando sesión...',
          text: 'Limpiando base de datos...',
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            MySwal.showLoading();
          },
        });

        try {
          await logout();
          MySwal.close();
          navigate(
            `${import.meta.env.VITE_HASH_BROWSER === true ? '#/' : `${URL}/`}`
          );
        } catch (error) {
          console.error('Error during logout:', error);
          MySwal.close();
          navigate(
            `${import.meta.env.VITE_HASH_BROWSER === true ? '#/' : `${URL}/`}`
          );
        }
      }
    });
  };

  const [navbarOpen, setNavbarOpen] = useState(false);

  return isAuthenticated ? (
    <>
      <nav className='relative flex flex-wrap items-center justify-between px-2 bg-slate-800 mb-1'>
        <div className='container px-4 mx-auto flex flex-wrap items-center justify-between'>
          <div className='w-full relative flex items-center justify-between lg:w-auto lg:static lg:block lg:justify-start'>
            <a
              className='text-lg font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-slate-200 hover:opacity-50'
              href={`${
                import.meta.env.VITE_HASH_BROWSER === true ? '#/' : `${URL}/`
              }`}
            >
              Inicio
            </a>
            <button
              className='text-slate-200 cursor-pointer text-xl leading-none px-3 py-0 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none'
              type='button'
            >
              <Hamburger onToggle={(toggled) => setNavbarOpen(!navbarOpen)} />
            </button>
          </div>
          <div
            className={
              'lg:flex flex-grow items-center' +
              (navbarOpen ? ' flex' : ' hidden')
            }
            id='example-navbar-danger'
          >
            <ul className='flex flex-col lg:flex-row list-none lg:ml-auto'>
              {PRIVACY.mesas.includes(user.rol) ? (
                <li className='nav-item'>
                  <a
                    className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-slate-200 hover:opacity-50'
                    href={`${
                      import.meta.env.VITE_HASH_BROWSER === true
                        ? '#/'
                        : `${URL}/`
                    }mesas`}
                  >
                    <span className='ml-2'>Mesas</span>
                  </a>
                </li>
              ) : (
                <></>
              )}
              {PRIVACY.prensa.includes(user.rol) ? (
                <li className='nav-item'>
                  <a
                    className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-slate-200 hover:opacity-50'
                    href={`${
                      import.meta.env.VITE_HASH_BROWSER === true
                        ? '#/'
                        : `${URL}/`
                    }prensa`}
                  >
                    <span className='ml-2'>Prensa</span>
                  </a>
                </li>
              ) : (
                <></>
              )}
              {PRIVACY.base.includes(user.rol) ||
              PRIVACY.prensa.includes(user.rol) ? (
                <li className='nav-item'>
                  <a
                    className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-slate-200 hover:opacity-50'
                    href={`${
                      import.meta.env.VITE_HASH_BROWSER === true
                        ? '#/'
                        : `${URL}/`
                    }estado`}
                  >
                    <span className='ml-2'>Estado</span>
                  </a>
                </li>
              ) : (
                <></>
              )}
              {PRIVACY.base.includes(user.rol) ||
              PRIVACY.prensa.includes(user.rol) ? (
                <li className='nav-item'>
                  <a
                    className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-slate-200 hover:opacity-50'
                    href={`${
                      import.meta.env.VITE_HASH_BROWSER === true
                        ? '#/'
                        : `${URL}/`
                    }escrutinio`}
                  >
                    <span className='ml-2'>Escrutinio</span>
                  </a>
                </li>
              ) : (
                <></>
              )}
              {PRIVACY.base.includes(user.rol) ? (
                <li className='nav-item'>
                  <a
                    className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-slate-200 hover:opacity-50'
                    href={`${
                      import.meta.env.VITE_HASH_BROWSER === true
                        ? '#/'
                        : `${URL}/`
                    }base`}
                  >
                    <span className='ml-2'>Base</span>
                  </a>
                </li>
              ) : (
                <></>
              )}
              {PRIVACY.admin.includes(user.rol) ? (
                <Menu
                  as='div'
                  className='relative inline-block text-right ml-2'
                >
                  <div>
                    <Menu.Button className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-slate-200 hover:opacity-50'>
                      Admin
                      <ChevronDownIcon
                        className='-mr-1 h-5 w-5 text-slate-200'
                        aria-hidden='true'
                      />
                    </Menu.Button>
                  </div>

                  <Transition
                    as={Fragment}
                    enter='transition ease-out duration-100'
                    enterFrom='transform opacity-0 scale-95'
                    enterTo='transform opacity-100 scale-100'
                    leave='transition ease-in duration-75'
                    leaveFrom='transform opacity-100 scale-100'
                    leaveTo='transform opacity-0 scale-95'
                  >
                    <Menu.Items className='absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-slate-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                      <div className='py-1'>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href={`${
                                import.meta.env.VITE_HASH_BROWSER === true
                                  ? '#/'
                                  : `${URL}/`
                              }admin/tables`}
                              className={classNames(
                                active
                                  ? 'bg-slate-800 text-slate-200 text-sm uppercase font-bold'
                                  : 'bg-slate-100 text-slate-800 text-sm uppercase font-bold',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              Mesas
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href={`${
                                import.meta.env.VITE_HASH_BROWSER === true
                                  ? '#/'
                                  : `${URL}/`
                              }admin/partidos`}
                              className={classNames(
                                active
                                  ? 'bg-slate-800 text-slate-200 text-sm uppercase font-bold'
                                  : 'bg-slate-100 text-slate-800 text-sm uppercase font-bold',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              Partidos
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href={`${
                                import.meta.env.VITE_HASH_BROWSER === true
                                  ? '#/'
                                  : `${URL}/`
                              }admin/usuarios`}
                              className={classNames(
                                active
                                  ? 'bg-slate-800 text-slate-200 text-sm uppercase font-bold'
                                  : 'bg-slate-100 text-slate-800 text-sm uppercase font-bold',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              Usuarios
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href={`${
                                import.meta.env.VITE_HASH_BROWSER === true
                                  ? '#/'
                                  : `${URL}/`
                              }admin/exportar`}
                              className={classNames(
                                active
                                  ? 'bg-slate-800 text-slate-200 text-sm uppercase font-bold'
                                  : 'bg-slate-100 text-slate-800 text-sm uppercase font-bold',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              Exportar Datos
                            </a>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <></>
              )}
              <li className='nav-item'>
                <button
                  className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-slate-200 hover:text-rose-800'
                  onClick={onLogout}
                >
                  <span className='ml-2'>Cerrar Sesión</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  ) : (
    <>
      <nav className='relative flex flex-wrap items-center justify-between px-2 bg-slate-800 mb-1'>
        <div className='container px-4 mx-auto flex flex-wrap items-center justify-between'>
          <div className='w-full relative flex items-center justify-between lg:w-auto lg:static lg:block lg:justify-start'>
            <a
              className='text-lg font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-slate-200'
              href={`${
                import.meta.env.VITE_HASH_BROWSER === true ? '#/' : `${URL}/`
              }login`}
            >
              Login
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
