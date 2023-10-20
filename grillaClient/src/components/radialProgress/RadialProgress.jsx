<div
  className="radial-progress text-center font-medium"
  style={{
    "--value": `${percent}`,
    "--size": "10rem",
    "--thickness": "2px",
  }}
>
  <h1 className="text-m">Mesa {number}</h1>
  <h2 className="text-m">
    {voted} / {totalPersons} ({percent == "NaN" ? "0.00" : percent}
    %)
  </h2>
</div>;
