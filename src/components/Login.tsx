import { useSession, signIn, signOut } from 'next-auth/react'

const Login = (): React.ReactElement => {
  const { data: session, status } = useSession()

  const onClick = (): void => {
    if (typeof session !== 'undefined' && session !== null) {
      handleSignOut().catch((error) => {
        console.log(error)
      })
    } else {
      handleSignIn().catch((error) => {
        console.log(error)
      })
    }
  }

  const handleSignIn = async (): Promise<void> => {
    await signIn('spotify')
  }

  const handleSignOut = async (): Promise<void> => {
    await signOut()
  }

  return (
    <>
      {typeof session !== 'undefined' && session !== null ? (
        <p>Signed in as {session?.user?.name}</p>
      ) : (
        <></>
      )}
      <button onClick={onClick} disabled={status === 'loading'}>
        Sign {typeof session !== 'undefined' && session !== null ? 'Out' : 'In'}
      </button>
    </>
  )
}

export default Login
