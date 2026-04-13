const BugCard = ({ title, priority, status, assignedTo }) => {
  return (
    <div
      style={{
        border: "1px solid gray",
        padding: "10px",
        margin: "10px",
        borderRadius: "10px",
      }}
    >
      <h3>{title}</h3>
      <p>Priority: {priority}</p>
      <p>Status: {status}</p>
      <p>Assigned To: {assignedTo}</p>
    </div>
  );
};

export default BugCard;