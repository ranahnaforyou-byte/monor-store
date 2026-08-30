import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { saveCategoryAction, deleteCategoryAction } from "@/app/actions/admin";
import { PageHeader, Panel, TableWrap, Th, Td, Field } from "@/components/admin/ui";
import { Input, Textarea } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireRole("MANAGER");
  const categories = await db.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <PageHeader title="الفئات" description={`${categories.length} فئة`} />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <TableWrap>
          <thead>
            <tr><Th>الاسم</Th><Th>الرابط</Th><Th>منتجات</Th><Th>ترتيب</Th><Th></Th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <Td>{c.name}</Td>
                <Td className="num text-xs text-muted">{c.slug}</Td>
                <Td className="num">{c._count.products}</Td>
                <Td className="num">{c.position}</Td>
                <Td>
                  <form action={deleteCategoryAction.bind(null, c.id)}>
                    <button className="text-xs text-sale hover:underline">حذف</button>
                  </form>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>

        <Panel title="فئة جديدة">
          <form action={saveCategoryAction} className="space-y-3">
            <Field label="الاسم (عربي)"><Input name="name" required /></Field>
            <Field label="الاسم (فرنسي)"><Input name="nameFr" /></Field>
            <Field label="الرابط" hint="اختياري — يُولّد من الاسم"><Input name="slug" dir="ltr" /></Field>
            <Field label="الوصف"><Textarea name="description" rows={2} /></Field>
            <Field label="رابط صورة الفئة"><Input name="image" dir="ltr" /></Field>
            <Field label="الترتيب"><Input name="position" type="number" defaultValue={0} className="w-24" dir="ltr" /></Field>
            <Button type="submit">إنشاء</Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
