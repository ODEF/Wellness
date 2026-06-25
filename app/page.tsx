import { createClient } from "../lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: todos, error } = await supabase.from("todos").select("*");

  if (error) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Supabase error</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>Healthy Paw</h1>

      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
      </ul>
    </main>
  );
}
// import { createClient } from '@/utils/supabase/server'
// import { cookies } from 'next/headers'

// export default async function Page() {
//   const cookieStore = await cookies()
//   const supabase = createClient(cookieStore)

//   const { data: todos } = await supabase.from('todos').select()

//   return (
    // <ul>
    //   {todos?.map((todo) => (
    //     <li key={todo.id}>{todo.name}</li>
    //   ))}
    // </ul>
//   )
// }