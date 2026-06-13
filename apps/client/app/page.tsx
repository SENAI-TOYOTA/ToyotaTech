import { redirect } from "next/navigation";

export default function Home() {
  // Redireciona automaticamente a rota raiz para a página de cadastro
  redirect("/cadastro");
}
