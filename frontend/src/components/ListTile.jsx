export default function ListTile({ primary, secondary }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-none">
      <div>{primary}</div>
      <div className="opacity-70">{secondary}</div>
    </div>
  );
}
