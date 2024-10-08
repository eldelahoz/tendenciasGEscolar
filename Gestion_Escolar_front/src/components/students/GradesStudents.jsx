import React, { useState, useEffect } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import ReusableTable from "../ReusableTable";
import ReusableModal from "../ReusableModal";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  postCalificacion,
  getCalificacion,
  updateCalificacion,
  deleteCalificacion,
} from "../../services/GradesStudent";
import { getStudents } from "../../services/studenstService";
import { getCourses } from "../../services/coursesService";

const GradesStudents = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGrade, setCurrentGrade] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [newGrade, setNewGrade] = useState({
    student_id: "",
    course_id: "",
    qualification: "",
    evaluation_date: "",
  });

  const [grades, setGrades] = useState([]);

  useEffect(() => {
    const obtenerCalificacionYEstudiantes = async () => {
      const calificacionAsignada = await getCalificacion();
      const estudianteAsignado = await getStudents();
      const cursoAsignado = await getCourses();
      setEstudiantes(estudianteAsignado);
      setCursos(cursoAsignado);
      const dataEstudiantesYCuros = calificacionAsignada.map((grades) => {
        const estudianteDatos = estudianteAsignado.find(
          (estudiante) => estudiante.id === grades.student_id
        );
        const cursoDatos = cursoAsignado.find(
          (curso) => curso.id === grades.course_id
        );
        console.log(estudianteDatos, cursoDatos);
        return {
          ...grades,
          student_id: estudianteDatos.full_name,
          course_id: cursoDatos.course_name,
        };
      });
      setGrades(dataEstudiantesYCuros);
    };
    obtenerCalificacionYEstudiantes();
  }, []);

  const postQualification = async () => {
    await postCalificacion(newGrade);
  };

  const actulizarCalificacion = async (actualizar) => {
    await updateCalificacion(actualizar);
  };

  const handleUpdate = (id) => {
    const gradeToEdit = grades.find((grade) => grade.id === id);

    setCurrentGrade(gradeToEdit);
    setNewGrade(gradeToEdit);
    openModal();
  };

  const handleDelete = (id) => {
    const calificacionEliminada = grades.filter((grade) => grade.id !== id);
    if (calificacionEliminada.length !== grades.length) {
      deleteCalificacion(id);
      setGrades(calificacionEliminada);
    }
    console.log(`Eliminar calificación con ID: ${id}`);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentGrade(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGrade({ ...newGrade, [name]: value });
  };

  const handleAddOrUpdateGrade = (e) => {
    e.preventDefault();
    if (
      newGrade.student_id &&
      newGrade.course_id &&
      newGrade.qualification &&
      newGrade.evaluation_date
    ) {
      if (currentGrade) {
        setGrades(
          grades.map((grade) => {
            if (grade.id === currentGrade.id) {
              actulizarCalificacion(newGrade);
              return newGrade;
            }
            return grade;
          })
        );
      } else {
        postQualification();
        setGrades([...grades, { ...newGrade, id: grades.length + 1 }]);
      }
      closeModal();
      setNewGrade({
        id: "",
        student_id: "",
        course_id: "",
        qualification: "",
        evaluation_date: "",
      });
      window.location.reload();
    } else {
      alert("Por favor completa todos los campos.");
    }
  };

  const columns = [
    { label: "ID", accessor: "id" },
    { label: "Estudiante ", accessor: "student_id" },
    { label: "Curso ", accessor: "course_id" },
    { label: "Calificación", accessor: "qualification" },
    { label: "Fecha de Evaluación", accessor: "evaluation_date" },
    {
      label: "Acciones",
      accessor: "acciones",
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleUpdate(row.id)}
            className="text-blue-500 hover:text-blue-700"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-500 hover:text-red-700"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Calificaciones", 20, 10);

    const tableColumn = [
      "ID",
      "Estudiante ID",
      "Curso ID",
      "Calificación",
      "Fecha de Evaluación",
    ];
    const tableRows = [];

    grades.forEach((grade) => {
      const gradeData = [
        grade.id,
        grade.student_id,
        grade.course_id,
        grade.qualification,
        grade.evaluation_date,
      ];
      tableRows.push(gradeData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("calificaciones.pdf");
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between">
        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-500"
        >
          <span>Descargar PDF</span>
        </button>
        <button
          onClick={openModal}
          className="flex items-center gap-2 rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-500"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Agregar Calificación</span>
        </button>
      </div>

      <ReusableModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          currentGrade ? "Actualizar Calificación" : "Agregar Calificación"
        }
      >
        <form onSubmit={handleAddOrUpdateGrade} className="space-y-4 m-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estudiante
            </label>
            <select
              name="student_id"
              value={newGrade.student_id}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm  p-1"
              required
            >
              <option value="">Seleccione un estudiante: </option>
              {estudiantes
                ? estudiantes.map((estudiante) => (
                    <option value={estudiante.id} key={estudiante.full_name}>
                      {estudiante.full_name}
                    </option>
                  ))
                : null}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Curso
            </label>
            <select
              name="course_id"
              value={newGrade.course_id}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm  p-1"
              required
            >
              <option value="">Seleccione un curso: </option>
              {cursos
                ? cursos.map((curso) => (
                    <option value={curso.id} key={curso.course_name}>
                      {curso.course_name}
                    </option>
                  ))
                : null}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Calificación
            </label>
            <input
              type="number"
              name="qualification"
              value={newGrade.qualification}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm  p-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de Evaluación
            </label>
            <input
              type="date"
              name="evaluation_date"
              value={newGrade.evaluation_date}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
              required
            />
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
            >
              {currentGrade
                ? "Actualizar Calificación"
                : "Agregar Calificación"}
            </button>
          </div>
        </form>
      </ReusableModal>

      <ReusableTable title="Calificaciones" columns={columns} data={grades} />
    </div>
  );
};

export default GradesStudents;
