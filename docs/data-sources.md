# Agricultural Data Sources

The results screen queries these services directly from the device. No custom server or user account is required.

- NASA POWER: historical daily climate data for the selected field location.
- ISRIC SoilGrids 2.0: pH, clay, sand, silt, organic carbon, and bulk density for the 0–5 cm topsoil layer at 250 m resolution. API-provided scale factors are applied.
- SMAP/MODIS point queries through AppEEARS are not included in this demo because the tested access requires NASA Earthdata authentication.

## Scope and Limitations

The selected planting month is compared with observations from the same month in the most recent year of available data; this is not a forecast. Temperature and pH ranges in the recommendation are general references. SoilGrids provides modeled global predictions. These sources can inform a report, but they do not replace laboratory testing or advice from a local agronomist.