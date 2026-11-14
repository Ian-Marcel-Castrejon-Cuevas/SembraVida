# SembraVida

SembraVida is an Expo and React Native demo that helps growers explore whether a crop and planting month may suit a selected field location. It combines user-provided field information with public climate and soil data, then presents a preliminary recommendation with the supporting measurements.

The app interface is in U.S. English. The project is intended for demonstration and exploration, not as a substitute for local agronomic advice or field testing.

## What the App Does

The Explore flow collects six pieces of information:

1. Field coordinates, selected by tapping or moving a marker on the map in the native app, or entered manually.
2. Crop: corn, beans, or sorghum.
3. Water sources, such as rain, a well, a canal, or a river or reservoir.
4. Reported water availability.
5. Planned planting month.
6. Whether an irrigation system is available.

The Results screen puts a preliminary planting recommendation first, followed by the field details, NASA POWER climate metrics, and SoilGrids soil estimates.

## Data Sources

The app requests data directly from public services; it does not require a custom backend or user account.

- **NASA POWER** provides daily climate data for the selected coordinates. The app summarizes the latest year of available data, including average, maximum, and minimum temperature, total precipitation, relative humidity, and solar radiation. It also groups temperature and precipitation observations by calendar month for the planting recommendation.
- **ISRIC SoilGrids 2.0** provides modeled soil-property estimates for the 0–5 cm layer at approximately 250 m resolution. The app displays pH, clay, sand, silt, organic carbon, and bulk density, applying the scale factors returned by the API.

SMAP and MODIS are not queried in this demo. The point-data workflow tested for those sources through NASA AppEEARS requires NASA Earthdata authentication, so those sources are intentionally omitted from the no-login presentation flow.

More detail is available in [docs/data-sources.md](docs/data-sources.md).

## Recommendation Logic

The recommendation compares the selected crop with general reference ranges in `src/app/results.tsx`:

| Crop    | Average temperature | Monthly rainfall reference | Soil pH |
| ------- | ------------------: | -------------------------: | ------: |
| Corn    |            18–32 °C |             At least 50 mm | 5.5–7.5 |
| Beans   |            16–27 °C |             At least 40 mm | 5.5–7.0 |
| Sorghum |            20–35 °C |             At least 25 mm | 5.5–8.5 |

It compares the planned month with observations for that same calendar month in the most recent year returned by NASA POWER. It also considers the SoilGrids pH estimate and the water availability and irrigation answers entered by the user. A notable temperature or rainfall concern produces a “Not recommended without adjustments” result; less severe concerns produce “Potentially viable with precautions.” If the available monthly data are insufficient, the app says that it cannot make a recommendation.

These thresholds are simple demo heuristics, not validated crop models. The climate data are historical observations, not a forecast for the upcoming planting season. A favorable result does not guarantee germination, yield, profitability, or suitability for a particular variety or management system.

## Requirements

- Node.js compatible with Expo SDK 58. The SDK 58 documentation lists Node.js 22.13 or later.
- npm, included with Node.js.
- Expo Go for native-device testing. The project uses `react-native-maps`, which is included in Expo Go for SDK 58.
- An internet connection to retrieve NASA POWER and SoilGrids data.

## Install and Run

```bash
npm install
npx expo start
```

Scan the terminal QR code with Expo Go to open the native app. You can also start a platform-specific session:

```bash
npx expo start --ios
npx expo start --android
npx expo start --web
```

On iOS and Android, select the field by tapping the map or dragging its marker. On web, use the latitude and longitude fields; the native map component is replaced with a coordinate-entry prompt.

## Project Structure

```text
src/
  app/
    _layout.tsx       Expo Router tab navigation
    index.tsx         Home screen
    explore.tsx       Six-step field and crop questionnaire
    results.tsx       Recommendation and analysis results
    profile.tsx       Profile placeholder
  components/
    parcel-map.tsx    Native map selector
    parcel-map.web.tsx Web coordinate-entry fallback
  services/
    nasaPower.ts      NASA POWER request and climate summaries
    soilGrids.ts      SoilGrids request and soil-property scaling
    inegi.ts          Public INEGI/CIAT soil-layer client
```

The Results screen currently queries POWER and SoilGrids. The INEGI client is retained in `src/services/inegi.ts` for future use, but INEGI cartography is not currently shown or queried in the Results flow.

## Useful Commands

```bash
npx tsc --noEmit    # TypeScript check
npx expo lint       # Lint (requires an ESLint configuration)
npx expo-doctor     # Expo project diagnostics
```

The repository currently has no ESLint configuration or automated test suite. The TypeScript check may also report existing issues in the home screen's `StatusBar` prop and the web tab component; these are unrelated to the data-source or translation work.

## Limitations and Responsible Use

- NASA POWER and SoilGrids provide modeled or gridded estimates; their resolution is not parcel-level measurement.
- SoilGrids reports modeled values for a shallow topsoil layer. It does not replace a laboratory soil test.
- Historical monthly conditions do not predict future weather.
- Crop reference ranges in the recommendation are simplified and may vary by variety, location, planting method, soil management, and local climate.
- Verify recommendations with local agricultural extension resources or a qualified agronomist before making planting decisions.
- API availability, response times, and terms of use are controlled by the respective data providers.

## Credits

- [NASA POWER](https://power.larc.nasa.gov/)
- [ISRIC SoilGrids](https://www.isric.org/explore/soilgrids)
- [Expo](https://expo.dev/)
