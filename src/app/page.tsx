import Navbar from "@/components/navbar";
import SkinChooser from "@/app/skinchooser";
import {getServerSession} from "next-auth";
import {redirect} from "next/navigation";

export default async function Home() {
  const session = await getServerSession();
  if (!session?.user) {
    return redirect("/api/auth/signin");
  }

  return (
      <div className="flex flex-col h-screen">
        <Navbar/>
        <div className="flex-1 h-full max-h-full">
          <SkinChooser/>
        </div>
      </div>
  )
}
