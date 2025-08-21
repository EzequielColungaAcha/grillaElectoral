import { useContext } from 'react';
import { useState } from 'react';
import { AuthContext } from '../../context/authContext';
import { Spin as Hamburger } from 'hamburger-react';
import { useNavigate } from 'react-router-dom';
import { PRIVACY } from '../../config';
import { USER_DELETED } from '../../graphql/subscription';
import { useSubscription } from '@apollo/client';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { ConfirmModal } from '../modals/ConfirmModal';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar({ fixed }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const hashBrowser = import.meta.env.VITE_HASH_BROWSER;

  const onLogout = () => {
    logout();
    navigate(`${hashBrowser === true ? '#/' : '/'}`);
    setShowLogoutConfirm(false);
  };

  const { data: userDeleted, loading } = useSubscription(USER_DELETED, {
    onData: (data) => {
      const deletedUserId = data.data.data.userDeleted._id;
      if (deletedUserId == user.user_id) {
        logout();
      }
    },
  });

  const [navbarOpen, setNavbarOpen] = useState(false);

  return user ? (
    <>
      <nav className='relative flex flex-wrap items-center justify-between px-2 bg-zinc-800 mb-1'>
        <div className='container px-4 mx-auto flex flex-wrap items-center justify-between'>
          <div className='w-full relative flex items-center justify-between lg:w-auto lg:static lg:block lg:justify-start'>
            <a
              className='text-lg font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-zinc-200 hover:opacity-50'
              href={`${hashBrowser === true ? '#/' : '/'}`}
            >
              Inicio
            </a>
            <button
              className='text-zinc-200 cursor-pointer text-xl leading-none px-3 py-0 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none'
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
                    className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-zinc-200 hover:opacity-50'
                    href={`${hashBrowser === true ? '#/' : '/'}mesas`}
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
                    className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-zinc-200 hover:opacity-50'
                    href={`${hashBrowser === true ? '#/' : '/'}prensa`}
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
                    className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-zinc-200 hover:opacity-50'
                    href={`${hashBrowser === true ? '#/' : '/'}estado`}
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
                    className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-zinc-200 hover:opacity-50'
                    href={`${hashBrowser === true ? '#/' : '/'}escrutinio`}
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
                    className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-zinc-200 hover:opacity-50'
                    href={`${hashBrowser === true ? '#/' : '/'}base`}
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
                    <Menu.Button className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-zinc-200 hover:opacity-50'>
                      Admin
                      <ChevronDownIcon
                        className='-mr-1 h-5 w-5 text-zinc-200'
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
                    <Menu.Items className='absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-zinc-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                      <div className='py-1'>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href={`${
                                hashBrowser === true ? '#/' : '/'
                              }admin/tables`}
                              className={classNames(
                                active
                                  ? 'bg-zinc-800 text-zinc-200 text-sm uppercase font-bold'
                                  : 'bg-zinc-100 text-zinc-800 text-sm uppercase font-bold',
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
                                hashBrowser === true ? '#/' : '/'
                              }admin/partidos`}
                              className={classNames(
                                active
                                  ? 'bg-zinc-800 text-zinc-200 text-sm uppercase font-bold'
                                  : 'bg-zinc-100 text-zinc-800 text-sm uppercase font-bold',
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
                                hashBrowser === true ? '#/' : '/'
                              }admin/usuarios`}
                              className={classNames(
                                active
                                  ? 'bg-zinc-800 text-zinc-200 text-sm uppercase font-bold'
                                  : 'bg-zinc-100 text-zinc-800 text-sm uppercase font-bold',
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
                                hashBrowser === true ? '#/' : '/'
                              }admin/exportar`}
                              className={classNames(
                                active
                                  ? 'bg-zinc-800 text-zinc-200 text-sm uppercase font-bold'
                                  : 'bg-zinc-100 text-zinc-800 text-sm uppercase font-bold',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              Exportar Datos
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href={`${
                                hashBrowser === true ? '#/' : '/'
                              }admin/logs`}
                              className={classNames(
                                active
                                  ? 'bg-zinc-800 text-zinc-200 text-sm uppercase font-bold'
                                  : 'bg-zinc-100 text-zinc-800 text-sm uppercase font-bold',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              Logs del Sistema
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
                  className='px-3 py-2 flex items-center text-sm uppercase font-bold leading-snug text-zinc-200 hover:text-rose-800'
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <span className='ml-2'>Cerrar Sesión</span>
                </button>
              </li>

              <ConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={onLogout}
                title='¿Cerrar Sesión?'
                message='¿Estás seguro de que deseas cerrar la sesión?'
                type='warning'
                confirmText='Cerrar'
                cancelText='Cancelar'
              />
            </ul>
          </div>
        </div>
      </nav>
    </>
  ) : (
    <>
      <nav className='relative flex flex-wrap items-center justify-between px-2 bg-zinc-800 mb-1'>
        <div className='container px-4 mx-auto flex flex-wrap items-center justify-between'>
          <div className='w-full relative flex items-center justify-between lg:w-auto lg:static lg:block lg:justify-start'>
            <a
              className='text-lg font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-zinc-200'
              href={`${hashBrowser === true ? '#/' : '/'}login`}
            >
              Login
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
