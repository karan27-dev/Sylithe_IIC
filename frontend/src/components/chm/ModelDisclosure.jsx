export default function ModelDisclosure() {
    return (
      <p className="text-xs text-gray-400 mt-4">
        Inference grid: 1 m (resampled).  
        Input data: Sentinel-1/2, ALOS, DEM, climate (10–30 m native).  
        Method: Multi-sensor ML CHM (XGBoost).
      </p>
    );
  }
  