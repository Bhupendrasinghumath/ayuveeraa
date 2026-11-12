import { useSearchParams } from "react-router-dom";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  return (
    <div style={{ padding: "30px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", textTransform: "capitalize" }}>
        {category? category.replace(/-/g, " ") : "All Products"}
      </h1>
      <p style={{ marginTop: "10px" }}>
        Click  {category} in category section.
      </p>
    </div>
  );
}