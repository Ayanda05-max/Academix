function CourseCard(props) {
  return (
    <div>
      <h3>{props.name}</h3>
      <p>{props.description}</p>
      <button>View Course</button>
    </div>
  );
}

export default CourseCard;