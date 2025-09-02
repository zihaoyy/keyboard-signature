import Link from 'next/link';
import {useState} from 'react';
import {GithubIcon} from '@/components/icons/github';
import {AnimatePresence, motion} from 'motion/react';
import {useAuth} from '@/hooks/useAuth';

export default function ConnectGithub() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {user, signInWithGithub, signOut} = useAuth();

  const handleLogin = async () => {
    await signInWithGithub();
  };

  const handleLogout = async () => {
    await signOut();
    setDropdownOpen(false);
  };

  return (
    <div className='absolute top-6 right-6 z-20'>
      {!user ? (
        <button
          onClick={handleLogin}
          className='whitespace-nowrap text-white flex flex-row items-center gap-2 font-semibold cursor-pointer hover:bg-neutral-950 rounded-full bg-black border border-neutral-800/75 px-4 py-2 opacity-75 hover:opacity-100 duration-150 ease-out transition-opacity'
        >
          <GithubIcon width={20} height={20} className='fill-white'/>
          Connect with Github
        </button>
      ) : (
        <div className='relative'>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className='whitespace-nowrap text-white flex flex-row items-center gap-2 font-semibold cursor-pointer hover:bg-neutral-950 rounded-full bg-black border border-neutral-800/75 p-2 pr-4 opacity-75 hover:opacity-100 duration-150 ease-out transition-opacity'
          >
            <img
              src={user.profilePic}
              alt={`${user.username} profile picture`}
              className='size-7 rounded-full'
            />

            {user.username}
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{opacity: 0, y: -10, scale: 0.95}}
                animate={{opacity: 1, y: 0, scale: 1}}
                exit={{opacity: 0, y: -10, scale: 0.95}}
                transition={{duration: 0.15, ease: [0.26, 1, 0.6, 1]}}
                className='absolute right-0  gap-1 top-full mt-2 bg-neutral-950 border border-neutral-800 rounded-lg p-2 min-w-[120px]'
              >
                <Link
                  href='/claimed'
                  className='whitespace-nowrap cursor-pointer block w-full text-left px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-all duration-150 hover:duration-50'
                >
                  Claimed
                </Link>
                <button
                  onClick={handleLogout}
                  className='text-red-400 cursor-pointer block w-full text-left px-3 py-2 text-sm hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-150 hover:duration-50'
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
