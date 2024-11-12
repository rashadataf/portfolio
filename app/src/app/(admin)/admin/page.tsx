import { signOut } from "@/lib/auth";

export default function AdminHome() {
  return (
    <div>
      <h1>Admin Home</h1>
      <form
        action={async () => {
          "use server"
          await signOut({
            redirect: true,
            redirectTo: '/'
          })
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    </div>
  )
}
