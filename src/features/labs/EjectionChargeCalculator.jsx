import React, { useState, useEffect } from "react";
import BackButton from "../../components/BackButton";

const EjectionChargeCalculator = ({ data, globalData, onNavigate }) => {
  const [unitSystem, setUnitSystem] = useState("metric");
  const [diameter, setDiameter] = useState("");
  const [length, setLength] = useState("");
  const [pressure, setPressure] = useState(0.5); // Default 0.5 bar
  const [volume, setVolume] = useState(0);
  const [charge, setCharge] = useState(0);
  const [force, setForce] = useState(0);

  // Shear pins state
  const [shearCount, setShearCount] = useState(0);
  const [shearForce, setShearForce] = useState(147); // Default to M2 (147 N)
  const [calculatedShearPressure, setCalculatedShearPressure] = useState(0);

  const normalizeInput = (val) => {
    if (typeof val === "string") {
      return parseFloat(val.replace(",", ".")) || 0;
    }
    return parseFloat(val) || 0;
  };

  useEffect(() => {
    const d = normalizeInput(diameter);
    const l = normalizeInput(length);
    const p = parseFloat(pressure) || 0;

    if (unitSystem === "metric") {
      // Metric Calculation (mm, bar)

      // Calculate Area in mm^2
      const radius_mm = d / 2;
      const area_mm2 = Math.PI * Math.pow(radius_mm, 2);

      // Calculate Volume in mm^3
      const v_mm3 = area_mm2 * l;

      // Convert to cm^3 for display and charge calculation (1 cm^3 = 1000 mm^3)
      const v_cm3 = v_mm3 / 1000;
      setVolume(v_cm3);

      // Force in Newtons
      // Pressure is in bar. 1 bar = 0.1 N/mm^2
      // Force = Pressure (bar) * Area (mm^2) * 0.1
      const f_newtons = p * area_mm2 * 0.1;
      setForce(f_newtons);

      // Charge (Grams)
      // Formula derived from Ideal Gas Law for Black Powder
      // K_metric approx 0.0004566 => Divisor approx 2190
      const c = (p * v_cm3) / 2190;
      setCharge(c);

      // Shear Pins (Metric)
      if (shearCount > 0 && d > 0) {
        const totalForce_N = shearCount * shearForce;
        // Burst Pressure (bar)
        // P_bar = F_N / (Area_mm2 * 0.1)
        const burstPressure_bar = totalForce_N / (area_mm2 * 0.1);
        const targetPressure = burstPressure_bar * 1.5;
        setCalculatedShearPressure(targetPressure);
      } else {
        setCalculatedShearPressure(0);
      }
    } else {
      // Imperial Calculation (inches, PSI)
      const radius_in = d / 2;
      const area_in2 = Math.PI * Math.pow(radius_in, 2);
      const v_in3 = area_in2 * l;
      setVolume(v_in3);

      // Force in lbs
      const f_lbs = p * area_in2;
      setForce(f_lbs);

      // Charge (Grams)
      // Formula derived from Ideal Gas Law for Black Powder
      // K_imperial approx 0.000516 => Divisor approx 1939
      const c = (p * v_in3) / 1939;
      setCharge(c);

      // Shear Pins (Imperial)
      if (shearCount > 0 && d > 0) {
        const totalForce_lbs = shearCount * shearForce;
        const burstPressure_psi = totalForce_lbs / area_in2;
        const targetPressure = burstPressure_psi * 1.5;
        setCalculatedShearPressure(targetPressure);
      } else {
        setCalculatedShearPressure(0);
      }
    }
  }, [diameter, length, pressure, unitSystem, shearCount, shearForce]);

  const handleUnitChange = (system) => {
    if (system === unitSystem) return;

    // Convert inputs
    const d = normalizeInput(diameter);
    const l = normalizeInput(length);
    const p = parseFloat(pressure) || 0;
    const s = parseFloat(shearForce) || 0;

    if (system === "imperial") {
      // Metric -> Imperial
      // mm -> inches
      if (d) setDiameter(parseFloat((d / 25.4).toFixed(3)).toString());
      if (l) setLength(parseFloat((l / 25.4).toFixed(3)).toString());
      // bar -> psi
      if (p) setPressure(parseFloat((p * 14.5038).toFixed(1)).toString());

      // Convert Shear Force (N -> lbs)
      // Try to find a matching pin in the unified list
      const currentPin = data.inputs.shearPins.options.find(
        (opt) => Math.abs(opt.forceN - s) < 1
      );
      if (currentPin) {
        setShearForce(currentPin.forceLbs);
      } else {
        setShearForce((s * 0.224809).toFixed(0));
      }
    } else {
      // Imperial -> Metric
      // inches -> mm
      if (d) setDiameter(parseFloat((d * 25.4).toFixed(1)).toString());
      if (l) setLength(parseFloat((l * 25.4).toFixed(1)).toString());
      // psi -> bar
      if (p) setPressure(parseFloat((p / 14.5038).toFixed(2)).toString());

      // Convert Shear Force (lbs -> N)
      const currentPin = data.inputs.shearPins.options.find(
        (opt) => Math.abs(opt.forceLbs - s) < 1
      );
      if (currentPin) {
        setShearForce(currentPin.forceN);
      } else {
        setShearForce((s * 4.44822).toFixed(0));
      }
    }

    setUnitSystem(system);
  };

  const applyPreset = (type) => {
    if (type === "friction") {
      setPressure(unitSystem === "metric" ? 0.2 : 3);
    } else if (type === "shear") {
      setPressure(unitSystem === "metric" ? 1.2 : 18);
    }
  };

  const applyShearPressure = () => {
    if (calculatedShearPressure > 0) {
      setPressure(parseFloat(calculatedShearPressure.toFixed(1)));
    }
  };

  if (!data) return null;

  return (
    <section className="max-w-4xl mx-auto px-4 py-12 dark:text-white">
      <div className="flex justify-between items-center mb-8">
        <BackButton
          onClick={() => onNavigate(globalData.common.backTarget)}
          label={globalData.common.backButton}
        />

        <div className="flex border-2 border-black dark:border-white">
          <button
            onClick={() => handleUnitChange("metric")}
            className={`px-4 py-2 font-mono text-sm font-bold uppercase transition-colors ${
              unitSystem === "metric"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-white text-black hover:bg-gray-100 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            }`}
          >
            {globalData.common.unitSelector.metric}
          </button>
          <button
            onClick={() => handleUnitChange("imperial")}
            className={`px-4 py-2 font-mono text-sm font-bold uppercase transition-colors ${
              unitSystem === "imperial"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-white text-black hover:bg-gray-100 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            }`}
          >
            {globalData.common.unitSelector.imperial}
          </button>
        </div>
      </div>

      <div className="mb-12 border-l-4 border-skillshot pl-8">
        <h2 className="mb-6 text-4xl font-black tracking-tighter text-black dark:text-white sm:text-6xl md:text-7xl uppercase break-words">
          {data.heading}
        </h2>
        <p className="max-w-2xl text-2xl font-light leading-tight text-gray-800 dark:text-gray-300 sm:text-3xl font-mono">
          {data.preamble}
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              {data.inputs.diameter.label[unitSystem]}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
              className="w-full border-2 border-black dark:border-gray-600 dark:bg-gray-800 dark:text-white p-4 font-mono text-xl focus:outline-none focus:border-skillshot transition-colors"
              placeholder={data.inputs.diameter.placeholder[unitSystem]}
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              {data.inputs.length.label[unitSystem]}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full border-2 border-black dark:border-gray-600 dark:bg-gray-800 dark:text-white p-4 font-mono text-xl focus:outline-none focus:border-skillshot transition-colors"
              placeholder={data.inputs.length.placeholder[unitSystem]}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono">
              {data.inputs.length.helper}
            </p>
          </div>

          {/* Shear Pins Section */}
          <div className="border-t-2 border-gray-100 dark:border-gray-700 pt-6 mt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
              {data.inputs.shearPins.title}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                  {data.inputs.shearPins.countLabel}
                </label>
                <input
                  type="number"
                  min="0"
                  value={shearCount}
                  onChange={(e) => setShearCount(parseInt(e.target.value) || 0)}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white p-2 font-mono text-lg focus:outline-none focus:border-skillshot transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                  {data.inputs.shearPins.sizeLabel}
                </label>
                <select
                  value={shearForce}
                  onChange={(e) => setShearForce(parseInt(e.target.value))}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white p-2 font-mono text-sm focus:outline-none focus:border-skillshot transition-colors h-[46px]"
                >
                  {data.inputs.shearPins.options.map((opt) => (
                    <option
                      key={opt.name}
                      value={
                        unitSystem === "metric" ? opt.forceN : opt.forceLbs
                      }
                    >
                      {opt.name} (
                      {unitSystem === "metric"
                        ? opt.forceN +
                          " " +
                          globalData.common.units.force.metric
                        : opt.forceLbs +
                          " " +
                          globalData.common.units.force.imperial}
                      )
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {calculatedShearPressure > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    {data.inputs.shearPins.calculatedLabel}
                  </span>
                  <span className="font-mono font-bold dark:text-white">
                    {parseFloat((calculatedShearPressure / 1.5).toFixed(1))}{" "}
                    {globalData.common.units.pressure[unitSystem]}
                  </span>
                </div>
                <button
                  onClick={applyShearPressure}
                  className="w-full bg-black text-white dark:bg-white dark:text-black py-2 px-4 text-xs font-bold uppercase tracking-widest hover:bg-skillshot hover:text-black dark:hover:bg-skillshot dark:hover:text-white transition-colors"
                >
                  {data.inputs.shearPins.applyButton} (
                  {parseFloat(calculatedShearPressure.toFixed(1))}{" "}
                  {globalData.common.units.pressure[unitSystem]})
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              {data.inputs.pressure.label[unitSystem]}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={unitSystem === "metric" ? "0.1" : "2"}
                max={unitSystem === "metric" ? "2.0" : "30"}
                step={unitSystem === "metric" ? "0.1" : "1"}
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-skillshot"
              />
              <span className="font-mono text-xl font-bold w-16 text-right dark:text-white">
                {pressure}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => applyPreset("friction")}
                className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white border border-gray-200 dark:border-gray-700 px-2 py-1 rounded hover:border-black dark:hover:border-white transition-colors"
              >
                {data.inputs.pressure.presets.friction}
              </button>
              <button
                onClick={() => applyPreset("shear")}
                className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white border border-gray-200 dark:border-gray-700 px-2 py-1 rounded hover:border-black dark:hover:border-white transition-colors"
              >
                {data.inputs.pressure.presets.shear}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono">
              {data.inputs.pressure.helper[unitSystem]}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border-2 border-black dark:border-gray-600 p-8 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              {data.results.volume.label}
            </h3>
            <p className="font-mono text-4xl font-bold dark:text-white">
              {parseFloat(volume.toFixed(2))}{" "}
              <span className="text-lg text-gray-400 dark:text-gray-500">
                {data.results.volume.unit[unitSystem]}
              </span>
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              {data.results.force.label}
            </h3>
            <p className="font-mono text-4xl font-bold dark:text-white">
              {parseFloat(force.toFixed(1))}{" "}
              <span className="text-lg text-gray-400 dark:text-gray-500">
                {data.results.force.unit[unitSystem]}
              </span>
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              {data.results.charge.label}
            </h3>
            <p className="font-mono text-6xl font-black text-skillshot">
              {parseFloat(charge.toFixed(2))}{" "}
              <span className="text-2xl text-black dark:text-white">
                {data.results.charge.unit}
              </span>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-pre-line">
              {data.results.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EjectionChargeCalculator;
