import ReactCountryFlag from 'react-country-flag';

export default function CountryFlags({ channel: { countries = [] } }) {
  return countries.map((country) => (
    <span key={country} className='m-1'>
      <ReactCountryFlag countryCode={country.toUpperCase()} svg />
    </span>
  ));
}
