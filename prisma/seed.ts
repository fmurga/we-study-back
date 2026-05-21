import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as Typesense from 'typesense';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const typesense = new Typesense.Client({
  nodes: [{ host: process.env.TYPESENSE_HOST || 'localhost', port: parseInt(process.env.TYPESENSE_PORT || '8108'), protocol: process.env.TYPESENSE_PROTOCOL || 'http' }],
  apiKey: process.env.TYPESENSE_API_KEY || 'we-study-api-key',
  connectionTimeoutSeconds: 5,
});

async function main() {
  console.log('🌱  Seeding database...');

  // ── Wipe in FK-safe order ─────────────────────────────────────────────────
  await prisma.favourite.deleteMany();
  await prisma.report.deleteMany();
  await prisma.userFollow.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.note.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✓ Cleared existing data');

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagData = [
    { title: 'Matemática',    slug: 'matematica' },
    { title: 'Física',        slug: 'fisica' },
    { title: 'Química',       slug: 'quimica' },
    { title: 'Programación',  slug: 'programacion' },
    { title: 'Historia',      slug: 'historia' },
    { title: 'Inglés',        slug: 'ingles' },
    { title: 'Biología',      slug: 'biologia' },
    { title: 'Economía',      slug: 'economia' },
    { title: 'Parcial',       slug: 'parcial' },
    { title: 'Final',         slug: 'final' },
    { title: 'Apuntes',       slug: 'apuntes' },
    { title: 'Ejercicios',    slug: 'ejercicios' },
    { title: 'Resumen',       slug: 'resumen' },
    { title: 'Práctica',      slug: 'practica' },
  ];

  await prisma.tag.createMany({ data: tagData });
  const tags = await prisma.tag.findMany();
  const tagMap = Object.fromEntries(tags.map((t) => [t.slug, t.id]));
  console.log(`  ✓ Created ${tags.length} tags`);

  // ── Lessons ───────────────────────────────────────────────────────────────
  const lessonsData = [
    {
      name: 'Análisis Matemático I',
      description: 'Límites, derivadas, integrales y series. Base del cálculo para ingenierías.',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
    },
    {
      name: 'Física II – Ondas y Electromagnetismo',
      description: 'Oscilaciones, ondas mecánicas, circuitos eléctricos y campo electromagnético.',
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80',
    },
    {
      name: 'Programación I',
      description: 'Introducción a la programación imperativa con Python. Algoritmos y estructuras de datos básicas.',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
    },
    {
      name: 'Historia Argentina Contemporánea',
      description: 'Argentina del siglo XX: peronismo, dictaduras, democratización y crisis económicas.',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80',
    },
    {
      name: 'Inglés Técnico',
      description: 'Lectura y comprensión de textos técnico-científicos en inglés para carreras de ingeniería.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    },
  ];

  const lessons = await Promise.all(
    lessonsData.map((l) => prisma.lesson.create({ data: l })),
  );
  const lessonMap = Object.fromEntries(lessons.map((l) => [l.name, l.id]));
  console.log(`  ✓ Created ${lessons.length} lessons`);

  // ── Users ─────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password1', 10);

  const usersData = [
    {
      email: 'devtest@westudy.com',
      username: 'devtest',
      fullName: 'Dev Test',
      password: passwordHash,
      image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=devtest',
    },
    {
      email: 'sofia.gomez@westudy.com',
      username: 'sofiagomez',
      fullName: 'Sofía Gómez',
      password: passwordHash,
      image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=sofia',
    },
    {
      email: 'lucas.reyes@westudy.com',
      username: 'lucasreyes',
      fullName: 'Lucas Reyes',
      password: passwordHash,
      image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=lucas',
    },
    {
      email: 'valentina.paz@westudy.com',
      username: 'valepaz',
      fullName: 'Valentina Paz',
      password: passwordHash,
      image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=valentina',
    },
    {
      email: 'mateo.silva@westudy.com',
      username: 'mateosilva',
      fullName: 'Mateo Silva',
      password: passwordHash,
      image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=mateo',
    },
  ];

  const users = await Promise.all(
    usersData.map((u) => prisma.user.create({ data: u })),
  );
  const [devtest, sofia, lucas, valentina, mateo] = users;
  console.log(`  ✓ Created ${users.length} users`);

  // ── Posts ─────────────────────────────────────────────────────────────────
  const postsData = [
    {
      title: 'Resumen completo: Límites y Continuidad',
      description:
        'Repaso de todos los tipos de límites, casos indeterminados (0/0, ∞/∞) y criterios de continuidad. Incluye ejemplos resueltos paso a paso.',
      userId: sofia.id,
      lessonId: lessonMap['Análisis Matemático I'],
      tagSlugs: ['matematica', 'apuntes', 'parcial'],
    },
    {
      title: 'Ejercicios de integrales indefinidas — Resolución',
      description:
        'Ejercicios resueltos de integración por sustitución, partes y fracciones parciales. Ideal para el parcial de cálculo.',
      userId: lucas.id,
      lessonId: lessonMap['Análisis Matemático I'],
      tagSlugs: ['matematica', 'ejercicios', 'parcial'],
    },
    {
      title: 'Formulario de Física II — Ondas',
      description:
        'Fórmulas de movimiento armónico simple, ondas estacionarias, efecto Doppler y ecuaciones de Maxwell. Listo para imprimir.',
      userId: valentina.id,
      lessonId: lessonMap['Física II – Ondas y Electromagnetismo'],
      tagSlugs: ['fisica', 'resumen', 'final'],
    },
    {
      title: 'Circuitos RLC: Ejercicios Resueltos',
      description:
        'Resolución de circuitos en serie y paralelo con resistencias, inductancias y capacitores. Análisis en régimen permanente y transitorio.',
      userId: devtest.id,
      lessonId: lessonMap['Física II – Ondas y Electromagnetismo'],
      tagSlugs: ['fisica', 'ejercicios'],
    },
    {
      title: 'Python para principiantes — Clase 1',
      description:
        'Variables, tipos de datos, entrada/salida y estructuras de control. Notas de la primera semana de Programación I con ejemplos en Python 3.',
      userId: mateo.id,
      lessonId: lessonMap['Programación I'],
      tagSlugs: ['programacion', 'apuntes'],
    },
    {
      title: 'TP Resuelto: Algoritmos de ordenamiento',
      description:
        'Implementación en Python de Bubble Sort, Merge Sort y Quick Sort con análisis de complejidad temporal. Entregué y saqué 10.',
      userId: sofia.id,
      lessonId: lessonMap['Programación I'],
      tagSlugs: ['programacion', 'ejercicios', 'practica'],
    },
    {
      title: 'El Peronismo: causas, ascenso y caída',
      description:
        'Resumen del surgimiento del peronismo, el primer y segundo gobierno de Perón, el papel de Evita y el golpe del 55. Basado en clase y bibliografía de Romero.',
      userId: lucas.id,
      lessonId: lessonMap['Historia Argentina Contemporánea'],
      tagSlugs: ['historia', 'resumen', 'parcial'],
    },
    {
      title: 'Dictaduras militares 1955–1983',
      description:
        'Cronología de los gobiernos de facto, Proceso de Reorganización Nacional y violaciones a los derechos humanos. Incluye cuadro comparativo.',
      userId: valentina.id,
      lessonId: lessonMap['Historia Argentina Contemporánea'],
      tagSlugs: ['historia', 'apuntes'],
    },
    {
      title: 'Guía de reading: abstracts científicos',
      description:
        'Estrategias para leer y comprender abstracts en inglés. Vocabulario técnico frecuente, estructura del abstract y ejercicios de comprensión.',
      userId: devtest.id,
      lessonId: lessonMap['Inglés Técnico'],
      tagSlugs: ['ingles', 'practica'],
    },
    {
      title: '¿Cómo usar ChatGPT para estudiar? Tips que uso',
      description:
        'Formas en las que uso IA para resumir apuntes, generar flashcards, explicar conceptos difíciles y corregir mis trabajos. Sin hacer trampa.',
      userId: mateo.id,
      lessonId: null,
      tagSlugs: ['apuntes', 'practica'],
    },
    {
      title: 'Mis apuntes de Química Orgánica I — Unidad 2',
      description:
        'Nomenclatura de compuestos orgánicos, grupos funcionales y reacciones de sustitución. Faltan los ejercicios pero subo el resto.',
      userId: sofia.id,
      lessonId: null,
      tagSlugs: ['quimica', 'apuntes'],
    },
    {
      title: 'Recta tangente y derivada — Interpretación geométrica',
      description:
        'Explicación visual de la derivada como pendiente de la recta tangente. Incluye gráficos hechos con GeoGebra y ejemplos con funciones cuadráticas y cúbicas.',
      userId: lucas.id,
      lessonId: lessonMap['Análisis Matemático I'],
      tagSlugs: ['matematica', 'apuntes', 'ejercicios'],
    },
  ];

  const posts = await Promise.all(
    postsData.map(({ tagSlugs, ...data }) =>
      prisma.post.create({
        data: {
          ...data,
          slug: crypto.randomUUID(),
          tags: { connect: tagSlugs.map((s) => ({ id: tagMap[s] })) },
        },
      }),
    ),
  );
  console.log(`  ✓ Created ${posts.length} posts`);

  // ── Comments ──────────────────────────────────────────────────────────────
  const commentsData = [
    // Post 0 — Límites
    { content: 'Justo lo que necesitaba antes del parcial, gracias!', userId: lucas.id, postId: posts[0].id },
    { content: 'Podrías agregar los límites trigonométricos? Me cuesta ese tema.', userId: mateo.id, postId: posts[0].id },
    // Post 1 — Integrales
    { content: 'Los ejercicios de partes son los que más me cuestan, buena selección.', userId: sofia.id, postId: posts[1].id },
    { content: 'El ejercicio 3 tiene un error en el segundo paso, el signo del seno cambia.', userId: devtest.id, postId: posts[1].id },
    // Post 4 — Python clase 1
    { content: 'Perfecto para empezar! Yo también tomé esas notas jaja', userId: sofia.id, postId: posts[4].id },
    // Post 6 — Peronismo
    { content: 'Muy completo. Agregaría el rol de la CGT en el ascenso de Perón.', userId: valentina.id, postId: posts[6].id },
    { content: 'La fuente de Romero está bien, pero también chequeá a Halperín Donghi para el contexto.', userId: devtest.id, postId: posts[6].id },
    // Post 9 — ChatGPT
    { content: 'Interesante! Yo uso Notion AI para organizar mis notas.', userId: sofia.id, postId: posts[9].id },
    { content: 'Muy buena idea lo de las flashcards, no se me había ocurrido.', userId: valentina.id, postId: posts[9].id },
    { content: 'Ojo con las alucinaciones del modelo cuando pide explicar derivadas jaja.', userId: lucas.id, postId: posts[9].id },
  ];

  const comments = await Promise.all(
    commentsData.map((c) => prisma.comment.create({ data: c })),
  );

  // Replies
  await prisma.comment.createMany({
    data: [
      {
        content: 'Sí, los subo esta semana!',
        userId: sofia.id,
        postId: posts[0].id,
        parentCommentId: comments[1].id,
      },
      {
        content: 'Correcto, ya lo edité. Gracias por avisar!',
        userId: lucas.id,
        postId: posts[1].id,
        parentCommentId: comments[3].id,
      },
      {
        content: 'Eso exactamente es lo que intento hacer — leerlos juntos.',
        userId: lucas.id,
        postId: posts[6].id,
        parentCommentId: comments[6].id,
      },
    ],
  });
  console.log(`  ✓ Created ${comments.length + 3} comments`);

  // ── Follows ───────────────────────────────────────────────────────────────
  const followPairs = [
    [sofia.id, lucas.id],
    [sofia.id, mateo.id],
    [lucas.id, sofia.id],
    [lucas.id, valentina.id],
    [valentina.id, sofia.id],
    [valentina.id, devtest.id],
    [mateo.id, lucas.id],
    [mateo.id, devtest.id],
    [devtest.id, sofia.id],
  ];

  await prisma.userFollow.createMany({
    data: followPairs.map(([followerId, followingId]) => ({ followerId, followingId })),
  });
  console.log(`  ✓ Created ${followPairs.length} follows`);

  // ── Favourites (likes on posts) ───────────────────────────────────────────
  const favPairs = [
    [lucas.id, posts[0].id],
    [mateo.id, posts[0].id],
    [devtest.id, posts[0].id],
    [sofia.id, posts[1].id],
    [valentina.id, posts[2].id],
    [lucas.id, posts[4].id],
    [sofia.id, posts[4].id],
    [valentina.id, posts[5].id],
    [devtest.id, posts[6].id],
    [mateo.id, posts[9].id],
    [sofia.id, posts[9].id],
    [lucas.id, posts[9].id],
  ];

  await prisma.favourite.createMany({
    data: favPairs.map(([userId, postId]) => ({ userId, postId, type: 'POST' })),
  });
  console.log(`  ✓ Created ${favPairs.length} favourites`);

  // ── Calendar Events ───────────────────────────────────────────────────────
  const now = new Date();
  const d = (offsetDays: number, hour = 10) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + offsetDays);
    dt.setHours(hour, 0, 0, 0);
    return dt;
  };

  await prisma.calendarEvent.createMany({
    data: [
      { title: 'Parcial Análisis I', eventType: 'EXAM', startDate: d(3, 9), endDate: d(3, 11), userId: sofia.id, hasReminder: true, reminderMinutes: 60 },
      { title: 'Parcial Análisis I', eventType: 'EXAM', startDate: d(3, 9), endDate: d(3, 11), userId: lucas.id, hasReminder: true, reminderMinutes: 60 },
      { title: 'TP Programación — Entrega', eventType: 'ASSIGNMENT', startDate: d(5, 23), endDate: d(5, 23), userId: mateo.id, isAllDay: false },
      { title: 'Sesión de estudio — Física', eventType: 'STUDY_SESSION', startDate: d(1, 18), endDate: d(1, 20), userId: valentina.id },
      { title: 'Clase práctica Inglés', eventType: 'LESSON', startDate: d(2, 14), endDate: d(2, 16), userId: devtest.id },
      { title: 'Final Historia Argentina', eventType: 'EXAM', startDate: d(14, 10), endDate: d(14, 12), userId: lucas.id, hasReminder: true, reminderMinutes: 1440 },
      { title: 'Reunión de grupo — TP Física', eventType: 'MEETING', startDate: d(0, 20), endDate: d(0, 22), userId: sofia.id },
    ],
  });
  console.log('  ✓ Created 7 calendar events');

  // ── Typesense indexing ────────────────────────────────────────────────────
  try {
    const postsWithUser = await prisma.post.findMany({ include: { user: { select: { username: true } } } });
    await typesense.collections('posts').documents().import(
      postsWithUser.map((p) => ({
        id: p.id,
        title: p.title ?? '',
        description: p.description ?? '',
        username: p.user?.username ?? '',
        createdAt: Math.floor(p.createdAt.getTime() / 1000),
      })),
      { action: 'upsert' },
    );
    await typesense.collections('lessons').documents().import(
      lessons.map((l) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        createdAt: Math.floor(l.createdAt.getTime() / 1000),
      })),
      { action: 'upsert' },
    );
    await typesense.collections('users').documents().import(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        image: u.image ?? '',
      })),
      { action: 'upsert' },
    );
    console.log('  ✓ Indexed data in Typesense');
  } catch (err) {
    console.warn('  ⚠ Typesense indexing failed (service may be unavailable):', err.message);
  }

  console.log('\n✅  Seed complete!');
  console.log('\n  Test credentials (all use password: Password1)');
  users.forEach((u) => console.log(`    ${u.email}  /  @${u.username}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
