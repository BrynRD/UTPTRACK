export type ExperienciaLaboral = {
    id: string;
    empresa: string;
    puesto: string;
    fechaInicio: string;
    fechaFin: string | null;
    salario: number | null;
    descripcion: string;
};

export type EgresadoData = {
    id: string;
    codigoEstudiante: string;
    nombre: string;
    apellido?: string;
    correo?: string;
    edad: number;
    genero: string;
    carrera: string;
    sede: string;
    anoGraduacion: number;
    estadoLaboral: string;
    habilidadesTecnicas: string;
    habilidadesBlandas: string;
    telefono: string;
    dni: string;
    linkedin: string;
    tiene2fa: boolean;
    satisfaccionFormacion: number;
    tiempoPrimerEmpleo: number;
    empresa?: string;
    createdAt: string;
    updatedAt: string;
    experienciasLaborales?: ExperienciaLaboral[];
};