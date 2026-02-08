import React from 'react';
import '../../styles/AdminDashboard.css';

const HorarioComponent = ({ 
  scheduleData,   
  timeSlots,      
  days,           
  readOnly = false,
  draggedClass,
  onDrop,         
  onDragStart,    
  onAdd,          
  onEdit,         
  onView         
}) => {

  //manejador de eventos que se ejecuta justo cuando se arrastra una tarjeta de clase en el horario
  const handleDragStartInternal = (e, classItem) => {
    if (readOnly) return;
    e.dataTransfer.effectAllowed = "move";
    // esto actualizará el estado draggedClass
    onDragStart(classItem); 
  };

  const handleDragEndInternal = (e) => {
    document.querySelectorAll('.schedule-cell').forEach(el => el.classList.remove('drag-over'));
  };

  const handleDragOverInternal = (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeaveInternal = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDropInternal = (e, day, time) => {
    if (readOnly) return;
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    onDrop(e, day, time);
  };

  // --- RENDERIZADO ---
  const renderCell = (day, time) => {
    const classData = scheduleData.find(c => c.dia === day && c.hora_inicio === time);

    if (classData) {
      //verificar si es la clase que se esta arrastrando
      const isDragging = draggedClass && draggedClass.id_clase === classData.id_clase;

      return (
        <div 
          className={`class-card ${classData.color}`}
          draggable={!readOnly}
          onDragStart={(e) => handleDragStartInternal(e, classData)}
          onDragEnd={handleDragEndInternal}
          onClick={() => onView(classData)}
          style={{ 
            cursor: readOnly ? 'pointer' : 'grab',
            opacity: isDragging ? 0.5 : 1 
          }}
        >
          {!readOnly && (
            <div className="edit-icon" onClick={(e) => onEdit(e, classData)}>✏️</div>
          )}
          <span className="class-subject">{classData.nombre_asignatura}</span>
          <span className="class-prof">{classData.nombre_docente}</span>
          <span className="class-room">{classData.nombre_aula} - Sec. {classData.codigo_seccion}</span>
        </div>
      );
    }

    return (
      <div 
        className={!readOnly ? "add-ghost-btn" : ""}
        onDragOver={handleDragOverInternal}
        onDragLeave={handleDragLeaveInternal}
        onDrop={(e) => handleDropInternal(e, day, time)}
        onClick={() => !readOnly && onAdd(day, time)}
      >
        {!readOnly && "+"}
      </div>
    );
  };

  return (
    <div className="schedule-container">
      <div className="schedule-table">
        <div className="header-cell">Hora</div>
        {days.map(d => <div key={d} className="header-cell">{d}</div>)}

        {timeSlots.map((time, idx) => (
          <React.Fragment key={idx}>
            <div className="time-cell">{time}</div>
            {days.map(day => (
              <div key={`${day}-${time}`} className="schedule-cell">
                {renderCell(day, time)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HorarioComponent;