import AddNodeForm from '../AddNodeForm';

export default function AddNodeFormExample() {
  const handleSubmit = (data: any) => {
    console.log('Node data submitted:', data);
  };

  return (
    <div className="p-4 max-w-md bg-background">
      <AddNodeForm onSubmit={handleSubmit} />
    </div>
  );
}
