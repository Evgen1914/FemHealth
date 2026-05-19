import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Все таблицы имеют ON DELETE CASCADE от profiles → auth.users,
  // поэтому удаление auth-пользователя каскадно удалит всё.
  // Но profiles.id ссылается на auth.users(id) ON DELETE CASCADE,
  // значит удаляем auth-пользователя — и profiles, и всё остальное удалится.
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json(
      { error: `Ошибка удаления аккаунта: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
