import Navbar from "@/components/navbar";
import SkinChooser from "@/app/skinchooser";

export default function Home() {
  return (
      <div className="flex flex-col h-screen">
        <Navbar/>
        <div className="flex-1 h-full max-h-full">
          <SkinChooser/>
        </div>
      </div>
  )
}
