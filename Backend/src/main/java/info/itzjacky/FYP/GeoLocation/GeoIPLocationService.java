package info.itzjacky.FYP.GeoLocation;


import com.maxmind.geoip2.exception.GeoIp2Exception;

import java.io.IOException;

public interface GeoIPLocationService {
    GeoIP getIpLocation(String ip) throws IOException, GeoIp2Exception;
}