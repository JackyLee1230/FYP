package info.itzjacky.FYP.GeoLocation;


import lombok.Data;

@Data
public class GeoIP {

    private String ipAddress;
    private String city;
    private String fullLocation;
    private Double latitude;
    private Double longitude;

}