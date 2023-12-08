package info.itzjacky.FYP.GeoLocation;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.GeoIp2Exception;
import com.maxmind.geoip2.model.CityResponse;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.InetAddress;

import static java.util.Objects.nonNull;

@Service
public class GeoIPLocationServiceImpl implements GeoIPLocationService {

    private final DatabaseReader databaseReader;
    private static final String UNKNOWN = "UNKNOWN";

    public GeoIPLocationServiceImpl(DatabaseReader databaseReader) {
        this.databaseReader = databaseReader;
    }

    @Override
    public GeoIP getIpLocation(String ip) throws IOException, GeoIp2Exception {

        GeoIP position = new GeoIP();
        String location;

        InetAddress ipAddress = InetAddress.getByName(ip);

        CityResponse cityResponse = databaseReader.city(ipAddress);
        if (nonNull(cityResponse) && nonNull(cityResponse.getCity())) {

            String continent = (cityResponse.getContinent() != null) ? cityResponse.getContinent().getName() : "";
            String country = (cityResponse.getCountry() != null) ? cityResponse.getCountry().getName() : "";

            location = String.format("%s, %s, %s", continent, country, cityResponse.getCity().getName());
            position.setCity(cityResponse.getCity().getName());
            position.setFullLocation(location);
            position.setLatitude((cityResponse.getLocation() != null) ? cityResponse.getLocation().getLatitude() : 0);
            position.setLongitude((cityResponse.getLocation() != null) ? cityResponse.getLocation().getLongitude() : 0);
            position.setIpAddress(ip);

        }
        return position;
    }
}